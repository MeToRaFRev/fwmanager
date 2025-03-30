// controllers/requestController.js
const fs = require('fs');
const path = require('path');
const util = require('util');
const dns = require('dns')
const { v4: uuidv4 } = require('uuid');
const auditController = require('./auditController');
const requestsFilePath = path.join(__dirname, '../data/requests.json');

// Helper: Read requests from file (creates file if missing)
const readRequests = () => {
  if (!fs.existsSync(requestsFilePath)) {
    fs.writeFileSync(requestsFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(requestsFilePath);
  return JSON.parse(data);
};

// Helper: Write requests to file
const writeRequests = (requests) => {
  fs.writeFileSync(requestsFilePath, JSON.stringify(requests, null, 2));
};

// Return only the authenticated user's requests if not admin.
const getAllRequests = (req, res) => {
  let requests = readRequests();
  if (req.user.role !== 'admin') {
    // Filter requests to only include those created by the current user.
    requests = requests.filter(r => r.requester_name === req.user.username);
  }
  res.json(requests);
};

const getRequestById = (req, res) => {
  const { id } = req.params;
  const requests = readRequests();
  const found = requests.find(r => r.id === id);
  if (!found) {
    return res.status(404).json({ message: 'Request not found' });
  }
  // Non-admin users can only view their own requests.
  if (req.user.role !== 'admin' && found.requester_name !== req.user.username) {
    return res.status(403).json({ message: 'Access denied' });
  }
  res.json(found);
};

const createRequest = (req, res) => {
  const requests = readRequests();
  const { source_ip, destination_ip, port, protocol } = req.body;
  // validate that its not a duplicate request
  const duplicateRequest = requests.find(r => r.source_ip === source_ip && r.destination_ip === destination_ip && r.port === port && r.protocol === protocol);
  if (duplicateRequest) {
    return res.status(409).json({ message: 'Duplicate request', duplicateRequestId: duplicateRequest.id });
  }
  //WIP Need to add validation if duplicate rule already exists in firewall rules
  const newRequest = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
    status: "pending",       // Default status is "pending"
    reviewer_notes: "",        // No reviewer notes initially
    createdBy: req.user.username,
  };
  requests.push(newRequest);
  writeRequests(requests);
  auditController.logAction(req.user.username, 'createRequest', newRequest.id);
  res.status(201).json(newRequest);
};

const updateRequest = (req, res) => {
  const { id } = req.params;
  const { status, reviewer_notes } = req.body;
  const requests = readRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Request not found' });
  }
  // Only allow status update values that are valid.
  if (!["pending", "approved", "rejected","done"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }
  requests[index].status = status;
  requests[index].reviewer_notes = reviewer_notes || requests[index].reviewer_notes;
  writeRequests(requests);
  auditController.logAction(req.user.username, 'updateRequest', id);
  res.json(requests[index]);
};

const nsLookup = async (req, res) => {
  const { domain } = req.body;
  if (!domain) {
    return res.status(400).json({ message: 'IP address is required' });
  }
  try {
    console.log(`Performing nslookup for domain: ${domain}`);
    let response = await util.promisify(dns.resolve4)(domain);
    console.log(`nslookup result for ${domain}: ${response}`);
    if(Array.isArray(response) && response.length > 0){
      response = response[0];
    }
    res.json({ ip: response });
  } catch (error) {
    console.error(`Error performing nslookup for ${domain}: ${error.message}`);
    res.status(500).json({ message: 'Error performing nslookup', error: error.message });
  }
}


module.exports = {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  nsLookup,
};
