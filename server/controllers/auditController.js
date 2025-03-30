const fs = require('fs');
const path = require('path');

const auditFilePath = path.join(__dirname, '../data/audit.log');

const logAction = (username, action, resourceId) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    username,
    action,
    resourceId
  };
  fs.appendFileSync(auditFilePath, JSON.stringify(logEntry) + '\n');
};

const getAuditLog = (req, res) => {
  if (!fs.existsSync(auditFilePath)) {
    return res.json([]);
  }
  const data = fs.readFileSync(auditFilePath, 'utf-8');
  // Each line in the audit log is a separate JSON entry.
  const logs = data.trim().split('\n').map(line => JSON.parse(line));
  res.json(logs);
};

module.exports = {
  logAction,
  getAuditLog
};
