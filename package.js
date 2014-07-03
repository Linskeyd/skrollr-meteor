Package.describe({
  summary: "Popular Skrollr plugin set up for quick use with Meteor"
});

Package.on_use(function (api) {
  api.use('jquery', 'client');
  api.use('templating', 'client');
  api.imply('jquery', 'client');
  api.add_files(['skrollr.js', 'lib/skrollr-init.html', 'lib/skrollr-init.js'], 'client');
});