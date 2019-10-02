const BASE_URL = 'https://thinkful-list-api.herokuapp.com/kisobe/bookmarks';

const listApiFetch = function(url, method, newData){
  let error = false;
  return fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: newData
  })
    .then(res => {
      if(!res.ok) {
        error = {code: res.status};
      }
      return res.json();
    })
    .then(data=> {
      if(error){
        error.message = data.message;
        return Promise.reject(error);
      }
      return data;
    });
};

const getBookmarks = function() {
  return listApiFetch(`${BASE_URL}`);
};

const createBookmark = function(dataObject) {
  return listApiFetch(`${BASE_URL}`, 'POST', JSON.stringify(dataObject));
};

const updateBookmark = function(id, dataObject) {
  return listApiFetch(`${BASE_URL}/${id}`, 'PATCH', JSON.stringify(dataObject));
};

const deleteBookmark = function(id){
  return listApiFetch(`${BASE_URL}/${id}`, 'DELETE');
};

export default {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
};