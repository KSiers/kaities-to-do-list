'use strict';

var $taskInput = $("#new-task");
var $addButton = $("#add");
var $incompleteTasksList = $("#incomplete-tasks");
var $completedTasksList = $("#completed-tasks");
var taskMap = {};

var taskItem = {
    
    create: function() {
        var name = $taskInput.val();
        
        if (name.length > 0) {
			
			var task = $('<li></li>');
            var counter = $('[name="Task"]').length;
			var taskId = name+counter;
            task.attr('name', 'Task');
            task.data('name', name);
            task.data('status', 'pending');
			$(task).attr('taskid',taskId);
			
            
            task.append(addElement.checkbox('taskItem.toggleStatus(this)'));
            task.append(addElement.span(name));
            task.append(addElement.button('Edit', 'taskItem.edit(this)').addClass("edit"));
            task.append(addElement.button('Delete', 'taskItem.delete(this)').addClass("delete"));
            
            $incompleteTasksList.append(task);
            $taskInput.val('');
            
			var gcalId = createToDo(name,taskId);
		}
    },
    
    toggleStatus: function(input) {
        var task = $(input).parents('li[name="Task"]');
        
        if (input.checked) {
            task.detach();
            $completedTasksList.append(task);
        } else {
            task.detach();
            $incompleteTasksList.append(task);
        }
    },
    
    edit: function(button) {
        var task = $(button).parents('li[name="Task"]');
        var span = task.children('span[name="Name"]');
        var edit = task.children('button[name="Edit"]');
        var save = addElement.button('Save', 'taskItem.save(this)');
        var input = $('<input>');
        
        input.val(task.data('name'));
        input.attr('name', 'Edit');
        
        span.replaceWith(input);
        edit.replaceWith(save);
    },
    
    save: function(button) {
        var task = $(button).parents('li[name="Task"]');
        var input = task.children('input[name="Edit"]');
        var taskId = $(task).attr('taskid');
		
        input.focus();
        task.data('name', input.val());
		updateToDo(taskMap[taskId],input.val());

        var span = addElement.span(task.data('name'));
        var edit = addElement.button('Edit', 'taskItem.edit(this)');
        var save = task.children('button[name="Save"]');
        
        input.replaceWith(span);
        save.replaceWith(edit);

    },
   
        delete: function(button) {
        var task = $(button).parents('li[name="Task"]');
		var taskId = $(task).attr('taskid');
		deleteToDo(taskMap[taskId]);
        task.remove();
    } 
};

// This object allows you to create consistent, functional HTML elements in the DOM without having to re-write code.

var addElement = {
    checkbox: function(onchange) {
        var checkbox = $('<input>');
        checkbox.attr('type', 'checkbox');
        checkbox.attr('onchange', onchange);
 
        return checkbox;
    },
 
    span: function(text) {
        var span = $('<span></span>');
        span.attr('name', 'Name');
        span.text(text);
 
        return span;
    },

    button: function(text, onclick) {
        var button = $('<button></button>');
        button.attr('onclick', onclick);
        button.attr('type', 'button');
        button.attr('name', text);
        button.text(text);
 
        return button;
    }
};

$taskInput.focus();
$addButton.on("click", taskItem.create);

function createToDo(name,taskId){
	var todaysDate = new Date();
	var year = todaysDate.getYear()+1900;
	var month = todaysDate.getMonth()+1;
	var startDay = todaysDate.getDate();
	var endDay = todaysDate.getDate()+1;
	var startDate = year + '-' + month + '-' + startDay;
	var endDate = year + '-' + month + '-' + endDay;
	var event = {
	  'summary': name,
	  "start": {
		 "date": startDate
		},
	  "end": {
		 "date": endDate
		}
	};

	var request = gapi.client.calendar.events.insert({
	  'calendarId': 'primary',
	  'resource': event
	});

	request.execute(function(event) {
	  taskMap[taskId] = event.id;
	  return event.id;
	});
	
}
function updateToDo(id, name){
	var event = {};
	event.summary = name;

	var request = gapi.client.calendar.events.patch({
		'calendarId': 'primary',
		'eventId': id,
		'resource': event
	});

	request.execute(function (event) {
	   console.log(event);
	});
}
function deleteToDo(id){
	var request = gapi.client.calendar.events.delete({
            'calendarId': 'primary',
            'eventId': id
	});
	request.execute(function(response) {
		if(response.error || response == false){
			console.log('Error');
		}
		else{
			console.log('Success');               
		}
	});
}