/**
 * Module dependencies
 */

var should = require('should');
var Context = require('..');

describe('reference-count', function() {
  var context;
  beforeEach(function() {
    context = new Context();
  });

  it('should emit garbage events for a single actor', function(done) {
    context.on('garbage', function(resource) {
      resource.should.eql('resource3');
      done();
    });

    context.sweep('actor1')
      .count('resource1')
      .count('resource2')
      .count('resource3')
      .done();

    context.sweep('actor1')
      .count(['resource1', 'resource2'])
      .done();
  });

  it('should emit garbage events for multiple actors', function(done) {
    context.on('garbage', function(resource) {
      resource.should.eql('resource4');
      done();
    });

    // first pass

    context.sweep('actor1')
      .count('resource1')
      .count('resource2')
      .count('resource3')
      .done();

    context.sweep('actor2')
      .count('resource1')
      .count('resource3')
      .count('resource4')
      .done();

    // second pass

    context.sweep('actor1')
      .count('resource1')
      .count('resource2')
      .count('resource3')
      .done();

    context.sweep('actor2')
      .count('resource1')
      .count('resource3')
      .done();
  });

  it('should destroy old actors', function(done) {
    context.on('garbage', function(resource) {
      should.not.exist(resource);
      done();
    });

    var resources = [
      'resource1',
      'resource2',
      'resource3'
    ];

    context.sweep('actor1')
      .count(resources)
      .done();

    context.sweep('actor2')
      .count(resources)
      .done();

    context.destroy('actor2');
    // this sync call is ok since we're not doing any async stuff
    done();
  });
});
