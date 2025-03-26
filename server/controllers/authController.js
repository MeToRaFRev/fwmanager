const jwt = require('jsonwebtoken');
const ldap = require('ldapjs');
const config = require('../config/config');

const ldapConfig = {
  url: config.ldap.url, // e.g. "ldap://ldap.example.com"
  baseDN: config.ldap.baseDN, // e.g. "DC=example,DC=com"
  domainSuffix: config.ldap.domainSuffix, // e.g. "@example.com"
  adminGroup: config.ldap.adminGroup, // e.g. "CN=Admins,OU=Groups,DC=example,DC=com" or a substring thereof
};

const login = (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  
  // Create an LDAP client. In production, adjust tlsOptions accordingly.
  const client = ldap.createClient({
    url: ldapConfig.url,
    tlsOptions: { rejectUnauthorized: false },
  });

  // Build the user DN using the domainSuffix
  const userDN = `${username}${ldapConfig.domainSuffix}`;

  // Bind to LDAP with the user's credentials
  client.bind(userDN, password, (err) => {
    if (err) {
      console.error(`LDAP authentication failed for ${username}: ${err.message}`);
      client.unbind();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If the bind is successful, search for the user's group membership.
    const searchOptions = {
      scope: 'sub',
      filter: `(sAMAccountName=${username})`,
      attributes: ['memberOf'], // Fetch the groups
    };

    client.search(ldapConfig.baseDN, searchOptions, (err, searchRes) => {
      if (err) {
        console.error("LDAP search error:", err.message);
        client.unbind();
        return res.status(500).json({ message: "LDAP search error" });
      }

      let userGroups = [];

      searchRes.on('searchEntry', (entry) => {
        // The memberOf attribute might be a string or an array.
        if (entry.object.memberOf) {
          userGroups = Array.isArray(entry.object.memberOf)
            ? entry.object.memberOf
            : [entry.object.memberOf];
        }
      });

      searchRes.on('error', (err) => {
        console.error("LDAP search error event:", err.message);
        client.unbind();
        return res.status(500).json({ message: "LDAP search error" });
      });

      searchRes.on('end', () => {
        client.unbind();
        // Determine the user's role: if any group includes the adminGroup identifier, mark as admin.
        const role = userGroups.some((group) => group.includes(ldapConfig.adminGroup))
          ? 'admin'
          : 'user';

        // Sign a JWT token with the username and role
        const token = jwt.sign(
          { username, role },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );

        res.json({ token, username, role });
      });
    });
  });
};

const verify = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Token is required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    res.json({ username: decoded.username, role: decoded.role });
  });
};

module.exports = {
  login,
  verify,
};
