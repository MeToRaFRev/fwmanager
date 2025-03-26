module.exports = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET,
    ldap: {
        url: process.env.LDAP_URL,
        baseDN: process.env.LDAP_BASE_DN,
        adminGroup: process.env.LDAP_ADMIN_GROUP,
        bindDN: process.env.LDAP_BIND_DN,
        bindCredentials: process.env.LDAP_BIND_CREDENTIALS,
    },
  };
  