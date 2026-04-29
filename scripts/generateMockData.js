const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .option('env', {
    alias: 'e',
    type: 'string',
    description: 'Environment (dev|test|prod)',
    default: 'dev'
  })
  .argv;

// DB Configs
const dbConfigs = {
  dev: {
    host: 'localhost',
    user: 'root',
    password: 'jyx123',
    database: 'cp_ems_ruoyi',
    port: 3306
  },
  test: {
    host: 'localhost',
    user: 'root',
    password: 'password', // Placeholder
    database: 'cp_ems_ruoyi_test',
    port: 3306
  },
  prod: {
    host: 'localhost',
    user: 'root',
    password: 'password', // Placeholder
    database: 'cp_ems_ruoyi_prod',
    port: 3306
  }
};

const config = dbConfigs[argv.env];
if (!config) {
  console.error(`Unknown environment: ${argv.env}`);
  process.exit(1);
}

// Helper to generate random int
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to pick random from array
const randomPick = (items) => items[Math.floor(Math.random() * items.length)];

// Helper to pick random from array with weights
const randomWeighted = (items, weights) => {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    if (random < weights[i]) return items[i];
    random -= weights[i];
  }
  return items[items.length - 1];
};

async function generate() {
  console.log(`Connecting to ${argv.env} database at ${config.host}...`);
  let connection;
  try {
    connection = await mysql.createConnection(config);
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
  console.log(`Connected.`);

  const rollbackSqls = [];
  const insertSqlStatements = [];
  const now = dayjs();
  
  // Get users
  const [users] = await connection.execute('SELECT user_id, user_name FROM sys_user LIMIT 50');
  if (users.length === 0) {
      console.error("No users found in sys_user. Cannot assign orders.");
      process.exit(1);
  }
  const userIds = users.map(u => u.user_id);
  const userNames = users.map(u => u.user_name);

  // Get equipment info for device IDs/Names
  const [equipments] = await connection.execute('SELECT id, name, sn FROM equipment_info LIMIT 100');
  const equipmentNames = equipments.length > 0 ? equipments.map(e => e.name) : ['设备A', '设备B', '设备C'];

  // --- Repair Order ---
  console.log("Checking repair_order...");
  const [roCountResult] = await connection.execute('SELECT COUNT(*) as count FROM repair_order');
  const roCount = roCountResult[0].count;
  
  if (roCount === 0) {
    console.log("repair_order is empty. Generating data...");
    let roInserted = 0;
    
    for (let i = 0; i < 12; i++) {
      const month = now.subtract(i, 'month');
      const daysInMonth = month.daysInMonth();
      const count = randomInt(80, 200);

      const values = [];
      const placeholders = [];

      for (let j = 0; j < count; j++) {
        const day = randomInt(1, daysInMonth);
        const createTime = month.date(day).hour(randomInt(8, 18)).minute(randomInt(0, 59)).second(randomInt(0, 59)).format('YYYY-MM-DD HH:mm:ss');
        
        const status = randomWeighted(['0', '1', '2'], [0.2, 0.3, 0.5]); // 0=Pending, 1=In Progress, 2=Completed
        const orderNo = `RO-${month.format('YYYYMMDD')}-${String(j).padStart(4, '0')}`;
        const userId = randomPick(userIds);
        const userName = users.find(u => u.user_id === userId).user_name;
        const deviceName = randomPick(equipmentNames);
        
        let finishTime = null;
        let finishBy = null;
        if (status === '2') {
             finishTime = dayjs(createTime).add(randomInt(1, 48), 'hour').format('YYYY-MM-DD HH:mm:ss');
             finishBy = randomPick(userNames);
        }

        // Check idempotency (skip if orderNo exists - simplified here by assuming empty table check passed)
        
        // (order_no, order_content, project_name, order_status, user_id, create_time, finish_time, finish_by)
        values.push(orderNo, `维修 ${deviceName} 故障`, deviceName, status, userId, createTime, finishTime, finishBy);
        placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?)');
      }

      if (values.length > 0) {
        const sql = `INSERT INTO repair_order (order_no, order_content, project_name, order_status, user_id, create_time, finish_time, finish_by) VALUES ${placeholders.join(', ')}`;
        insertSqlStatements.push(connection.format(sql, values) + ';');
        await connection.execute(sql, values);
        roInserted += values.length;
      }
    }
    console.log(`Generated ${roInserted} repair orders.`);
    rollbackSqls.push(`DELETE FROM repair_order WHERE create_time >= '${now.subtract(12, 'month').format('YYYY-MM-DD')}';`);
  } else {
    console.log(`repair_order has ${roCount} records. Skipping generation.`);
  }

  // --- Inspection Record ---
  console.log("Checking inspection_record...");
  const [irCountResult] = await connection.execute('SELECT COUNT(*) as count FROM inspection_record');
  const irCount = irCountResult[0].count;

  if (irCount === 0) {
    console.log("inspection_record is empty. Generating data...");
    let irInserted = 0;

    for (let i = 0; i < 12; i++) {
      const month = now.subtract(i, 'month');
      const daysInMonth = month.daysInMonth();
      const count = randomInt(60, 150);

      const values = [];
      const placeholders = [];

      for (let j = 0; j < count; j++) {
        const day = randomInt(1, daysInMonth);
        const inspectionTime = month.date(day).hour(randomInt(8, 18)).minute(randomInt(0, 59)).second(randomInt(0, 59)).format('YYYY-MM-DD HH:mm:ss');
        
        // Result distribution: Normal (70%), Abnormal (20%), Pending Review (10%)
        // Mapping to status/remark
        const resultType = randomWeighted(['normal', 'abnormal', 'pending'], [0.7, 0.2, 0.1]);
        let status = '1'; // Completed
        let remark = '巡检结果: 正常';
        
        if (resultType === 'abnormal') {
            status = '1';
            remark = '巡检结果: 异常 - 需进一步检查';
        } else if (resultType === 'pending') {
            status = '0'; // In Progress
            remark = '待复查';
        }

        const deviceName = randomPick(equipmentNames);
        const planName = `巡检-${deviceName}-${month.format('YYYYMM')}`;
        const userId = randomPick(userIds);
        const userName = users.find(u => u.user_id === userId).user_name;

        // (plan_name, project_name, inspection_status, inspection_time, inspection_person, inspection_remark, user_id)
        values.push(planName, deviceName, status, inspectionTime, userName, remark, userId);
        placeholders.push('(?, ?, ?, ?, ?, ?, ?)');
      }

      if (values.length > 0) {
        const sql = `INSERT INTO inspection_record (plan_name, project_name, inspection_status, inspection_time, inspection_person, inspection_remark, user_id) VALUES ${placeholders.join(', ')}`;
        insertSqlStatements.push(connection.format(sql, values) + ';');
        await connection.execute(sql, values);
        irInserted += values.length;
      }
    }
    console.log(`Generated ${irInserted} inspection records.`);
    rollbackSqls.push(`DELETE FROM inspection_record WHERE inspection_time >= '${now.subtract(12, 'month').format('YYYY-MM-DD')}';`);
  } else {
    console.log(`inspection_record has ${irCount} records. Skipping generation.`);
  }

  // --- Realtime Alarm ---
  console.log("Checking realtime_alarm...");
  const [alarmCountResult] = await connection.execute('SELECT COUNT(*) as count FROM realtime_alarm');
  const alarmCount = alarmCountResult[0].count;

  if (alarmCount === 0) {
    console.log("realtime_alarm is empty. Generating data...");
    let alarmInserted = 0;
    
    // Generate for last 6 months
    for (let i = 0; i < 6; i++) {
        const month = now.subtract(i, 'month');
        const count = randomInt(20, 50); // Alarms per month

        const values = [];
        const placeholders = [];

        for (let j = 0; j < count; j++) {
             const day = randomInt(1, month.daysInMonth());
             const alarmTime = month.date(day).hour(randomInt(0, 23)).minute(randomInt(0, 59)).second(randomInt(0, 59)).format('YYYY-MM-DD HH:mm:ss');
             
             const device = randomPick(equipments);
             const deviceName = device ? device.name : '未知设备';
             const sn = device ? device.sn : 'UNKNOWN'; // Assuming sn exists in equipment object if we selected it, but we only selected name. 
             // Wait, I only selected id and name from equipment_info. I should check if I need sn.
             // RealtimeAlarm has 'equipment' field which seems to be name or SN. Based on previous grep, it was 'ZNVZW4GQWX' which looks like SN.
             // But 'area' is also there.
             // Let's assume 'equipment' is SN.
             
             const alarmLevel = randomWeighted(['0', '1', '2'], [0.5, 0.3, 0.2]); // 0: Info, 1: Warning, 2: Critical
             const alarmVal = (Math.random() * 100).toFixed(2);
             const paramName = randomPick(['Voltage', 'Current', 'Temperature', 'Power']);
             const alarmInfo = `${paramName} too high`;
             const area = 'Factory A';

             values.push(paramName, alarmTime, alarmInfo, alarmLevel, area, sn || 'SN001', alarmVal);
             placeholders.push('(?, ?, ?, ?, ?, ?, ?)');
        }
        
        if (values.length > 0) {
            const sql = `INSERT INTO realtime_alarm (param_name, alarm_time, alarm_info, alarm_level, area, equipment, alarm_val) VALUES ${placeholders.join(', ')}`;
            insertSqlStatements.push(connection.format(sql, values) + ';'); // Use connection.format to get valid SQL
            await connection.execute(sql, values);
            alarmInserted += values.length;
        }
    }
    console.log(`Generated ${alarmInserted} realtime alarms.`);
    rollbackSqls.push(`DELETE FROM realtime_alarm WHERE alarm_time >= '${now.subtract(6, 'month').format('YYYY-MM-DD')}';`);
  } else {
    console.log(`realtime_alarm has ${alarmCount} records. Skipping.`);
  }

  // --- Energy Statistics ---
  console.log("Checking energy_statistics...");
  const [esCountResult] = await connection.execute('SELECT COUNT(*) as count FROM energy_statistics');
  const esCount = esCountResult[0].count;

  if (esCount === 0) {
      console.log("energy_statistics is empty. Generating data...");
      let esInserted = 0;
      
      // Generate for last 6 months, daily for each equipment
      // Limit to 20 equipments to avoid too much data if list is huge
      const targetEquipments = equipments.slice(0, 20); 
      
      for (let i = 0; i < 6; i++) {
          const month = now.subtract(i, 'month');
          const daysInMonth = month.daysInMonth();
          
          for (let d = 1; d <= daysInMonth; d++) {
              const date = month.date(d).format('YYYY-MM-DD 00:00:00');
              const values = [];
              const placeholders = [];

              for (const eq of targetEquipments) {
                  const sn = eq.sn || `SN-${eq.id}`; // We need SN. I need to update the select query to fetch SN.
                  const energyType = '0'; // Electricity
                  const stats = (Math.random() * 50 + 10).toFixed(2); // 10-60 kWh
                  
                  values.push(sn, energyType, date, stats);
                  placeholders.push('(?, ?, ?, ?)');
              }

              if (values.length > 0) {
                  const sql = `INSERT INTO energy_statistics (equipment_sn, energy_type, time, statistics) VALUES ${placeholders.join(', ')}`;
                  insertSqlStatements.push(connection.format(sql, values) + ';');
                  await connection.execute(sql, values);
                  esInserted += values.length;
              }
          }
      }
      console.log(`Generated ${esInserted} energy statistics.`);
      rollbackSqls.push(`DELETE FROM energy_statistics WHERE time >= '${now.subtract(6, 'month').format('YYYY-MM-DD')}';`);
  } else {
      console.log(`energy_statistics has ${esCount} records. Skipping.`);
  }

  // Generate Rollback Script
  if (rollbackSqls.length > 0) {
      const rollbackFile = path.join(__dirname, 'rollback_mock_data.sql');
      fs.writeFileSync(rollbackFile, rollbackSqls.join('\n'));
      console.log(`Rollback script created at ${rollbackFile}`);
  }

  // Generate Insert Script
  if (insertSqlStatements.length > 0) {
      const insertFile = path.join(__dirname, 'insert_mock_data.sql');
      fs.writeFileSync(insertFile, insertSqlStatements.join('\n'));
      console.log(`Insert script created at ${insertFile}`);
  }

  await connection.end();
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
