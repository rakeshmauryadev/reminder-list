const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect(
  'mongodb+srv://admin-rsinghbuddy:Test123@cluster0-kiuy6.mongodb.net/todolistDB',
  {
    useNewUrlParser: true,
  }
);

const itemsSchema = {
  name: String,
};
const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: 'Welcome to yout todolist!!',
});
const item2 = new Item({
  name: 'Hit the + button to add new todo!!',
});
const item3 = new Item({
  name: '<-- Hit this to delete an item!!',
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model('list', listSchema);

app.get('/', function (req, res) {
  Item.find(function (err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('list added successfully');
        }
      });
      res.redirect('/');
    } else {
      res.render('list', { listTitle: 'To-Do', newListItems: items });
    }
  });
});

app.post('/', function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });

  if (listName === 'To-Do') {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }
});

app.post('/delete', function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === 'To-Do') {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log('Successfully deleted');
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect('/' + listName);
        }
      }
    );
  }
});

app.get('/:anything', function (req, res) {
  const customListName = _.capitalize(req.params.anything);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect('/' + customListName);
      } else {
        //show existing list
        res.render('list', {
          listTitle: customListName,
          newListItems: foundList.items,
        });
      }
    }
  });
});

let port = process.env.PORT;
if (port == null || port == '') {
  port = 3000;
}

app.listen(port, function () {
  console.log('server started!!!');
});
