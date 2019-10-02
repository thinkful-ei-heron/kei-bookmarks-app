import bookmark from './bookmark.js';

const main = function() {
  bookmark.syncStoreWithAPI();
  bookmark.bindEventListeners();
};

$(main);