module.exports = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET,
    ldap: {
        url: process.env.LDAP_URL,
        baseDN: process.env.LDAP_BASE_DN,
        domainSuffix: process.env.LDAP_DOMAIN_SUFFIX,
        adminGroup: process.env.LDAP_ADMIN_GROUP,
    },
  };
  