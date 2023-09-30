//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Mongoose actions

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = {
  name: String
}; 

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("list", listSchema);



app.get("/", function(req, res) {
  async function showItems() {
    const foundItems = await Item.find({});

    if (foundItems.length === 0) {
      async function insertItems() {

        await Item.insertMany(defaultItems);
        console.log("default items saved to DB successfully")
      }
      try {
        insertItems();
      } catch(e) {
        console.log(e);
      }
      res.render("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    } 
  }
  try {
    showItems()
  }
  catch(e) {
    console.log(e);
  }

});

app.get("/:customListName", function(req, res) {
  const customListName = req.params.customListName;
  
  async function findDocument() {
    const foundedDocument = await List.findOne({name: customListName});
    if(!foundedDocument) {
      // Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    
      list.save();
      res.redirect("/" + customListName);

    } else {
      // show an existing list

      res.render("list", {listTitle: foundedDocument.name, newListItems: foundedDocument.items});
    }
  }

  try {
    findDocument()
  }

  catch(e) {
    console.log(e);
  }
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const todoItem = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    todoItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
  }

  
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  async function deleteById() {
    await Item.findByIdAndRemove(checkedItemId);
  }
  try {
    deleteById();
    console.log("successfully deleted checked item");
    res.redirect("/");
  } catch(err) {
    console.log(err)
  }
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
