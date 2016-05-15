import document from 'global/document';

import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';

import plugin from '../src/plugin';

const Player = videojs.getComponent('Player');

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

QUnit.module('videojs-title-bar', {

  beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5. This MUST come
    // before any player is created; otherwise, timers could get created
    // with the actual timer methods!
    this.clock = sinon.useFakeTimers();

    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
  },

  afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

QUnit.test('registers itself with video.js', function(assert) {
  assert.expect(2);

  assert.strictEqual(
    Player.prototype.titleBar,
    plugin,
    'videojs-title-bar plugin was registered'
  );

  this.player.titleBar();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  assert.ok(
    this.player.hasClass('vjs-title-bar'),
    'the plugin adds a class to the player'
  );
});

QUnit.test('does not add title if not configured', function(assert) {
  assert.expect(1);

  this.player.titleBar();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  assert.equal(
    0,
    this.player.contentEl().getElementsByClassName('vjs-title-bar-content').length,
    'The plugin should not add content to the player if no title is configured'
  );
});

QUnit.test('does add title if not configured', function(assert) {
  assert.expect(1);

  this.player.titleBar({ title: 'Dummy Title' });

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  const container = this.player.contentEl()
    .getElementsByClassName('vjs-title-bar-content')[0];

  assert.equal(
    'Dummy Title',
    container.innerHTML,
    'The plugin should add content to the player if no title is configured'
  );
});
