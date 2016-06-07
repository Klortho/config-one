module.exports = {
  'current-site': 'prod',
  sites: {
    dev: {
      port: 8870,
      path: '/home/acme/project', 
    },
    prod: {
      port: 80,
      path: '/var/acme/data',
    }
  }
};
