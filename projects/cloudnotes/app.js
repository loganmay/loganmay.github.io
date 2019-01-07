(function(global) {
    
    // State / Globals
    var id = 0;
	var position = 0;
	var dragFlag = 0;
	var clickFlag = 0;
	
	var notesPerRow = 4;
	var cellHeight = 139;
	var cellWidth = 256;
    
    // Nodes
    var NoteAdder = document.querySelector('#note-adder');
	var NoteUpdaterWrapper = document.querySelector('#note-updater-wrapper');
	var NoteUpdater = NoteUpdaterWrapper.querySelector('#note-updater');
    var NoteTitle = NoteAdder.querySelector('#note-title');
    var NoteBody = NoteAdder.querySelector('#note-body');
    var DoneButton = NoteAdder.querySelector('.done'); // this is just the button from the NoteAdder
	var ArchiveNoteButtons = document.querySelectorAll('.archive-note-button');
	var AddImageButtons = document.querySelectorAll('add-image-button');
    var Notes = document.querySelector('#notes');
	var PosGrid = document.querySelector('#pos-grid');
	
	var hideFullNote = function(e) {
        this.querySelectorAll('.note-button-bar li').forEach(function(li) {
            li.style.opacity = '0';
        });    
    };
	
	// initialize ---------------------------------------
	
	function init() {
		
		var notes = loadNotes();
		
		createGrid(notes);
		id = getNextId(notes);
		position = getNextPosition(notes);
		
		notes.forEach(function(note) {
			addNoteToDOM(note);
		});
		
		// First time
		console.log(window.localStorage.getItem('firstTime'));
		if (window.localStorage.getItem('firstTime') === null) {
			window.localStorage.setItem('firstTime', 'false');
			toggleHelp();
		}
	};
	
	function loadNotes() {
		if (window.localStorage.getItem('notes') === null) return [];
		var notes = JSON.parse(window.localStorage.getItem('notes'));
		return notes;
	};
	
	function getLastId(notes) {
		notes.forEach(function(note) {
			if (note.id > id) id = note.id
		});

		return id;
	};
	
	function getNextId(notes) {
		return getLastId(notes)+1;
	}
	
	function getNextPosition(notes) {
		if (notes.length < 4) {
			return notes.length+1;
		}
		
		var lastNote = null;
		notes.forEach(function(note) {
			if (note.position > position) {
				position = note.position;
				lastNote = note;
			};
		});
		position++;
		var aboveIndex = notes.indexOf(lastNote) - notesPerRow;
		if (aboveIndex > -1) {
			var above = notes[aboveIndex];
			while (above.height > 1) {
				position++;
				aboveIndex++;
				above = notes[aboveIndex];
			};
		}
		return position;
	};
	
	function createGrid(notes) {
		var numRows = Math.ceil(notes.length / notesPerRow);
		
		if (numRows === 0) {
			return;
		} else {
			for (var i = 0; i < numRows; i++) {
				addGridRow();
			};
		};
	};
	
	function addGridRow() {
		var lastGridId = getLastGridId();
		var nextGridId = null;
		(lastGridId === -1) ? nextGridId = 0 : nextGridId = lastGridId + 1;
		for (var i = 0; i < notesPerRow; i++) {
			var cell = document.createElement('div');
			cell.setAttribute('class', 'cell');
			cell.setAttribute('data-gridid', i + nextGridId);
			cell.setAttribute('data-full', 'false');
			PosGrid.appendChild(cell);
		};
	};
	
	function getLastGridId() {
		return PosGrid.querySelectorAll('.cell').length - 1;
	}
	
	global.addEventListener('load', init);
	
    // clearPlaceholder ----------------------------------
    function clearPlaceholder(e) {
        e.target.classList = '';
    };
    
    NoteBody.addEventListener('keypress', function(e) {
		if (!(e.ctrlKey && e.code === 'Enter')) clearPlaceholder(e);
	});
    NoteTitle.addEventListener('keypress', function(e) {
		if (!(e.ctrlKey && e.code === 'Enter')) clearPlaceholder(e);
	});
	
	// addPlaceholder -----------------------------------
	function addPlaceholder(e) {
		if (e.target === NoteTitle) NoteTitle.classList = 'title-placeholder';
		if (e.target === NoteBody) NoteBody.classList = 'body-placeholder';
	};

    NoteBody.addEventListener('keyup', function(e) {
		if (e.target.innerHTML === '') addPlaceholder(e);
	});
    NoteTitle.addEventListener('keyup', function(e) {
		if (e.target.innerHTML === '') addPlaceholder(e);
	});
    
    // handleInputKeystrokes -----------------------------
    
    function handleInputKeystrokes(e) {
        // Handle submit
        if (e.key === 'Enter' && e.ctrlKey) createNote();
		// Handle Paste
		if (e.key === 'v' && e.ctrlKey && e.target.innerHTML !== '') clearPlaceholder(e);
    };

    NoteBody.addEventListener('keyup', handleInputKeystrokes);
    NoteTitle.addEventListener('keyup', handleInputKeystrokes);
	
	// Deleting Notes -------------------------------------
	function deleteNote(e) {
		e.stopImmediatePropagation();
		var Note = e.target.offsetParent;

		// Grid
		var position = Note.dataset.position;
		unfillCell(position);
		unfillCellsBelow(Note);
		
		// DOM and Data
		removeNoteFromDOM(Note);
		unsaveNote(Note);
		
		// Reposition
		var NotesToUpdate = getNotesAfter(position);
		NotesToUpdate.forEach(function(Note) {
			positionNote(Note);
		});
		
		removeEmptyGridRows();
	};
	
	function getNotesAfter(position) {
		var NotesAfter = [];
		Notes.querySelectorAll('.note').forEach(function(note) {
			if (parseInt(note.dataset.position) > position) NotesAfter.push(note);
		});
		return NotesAfter;
	}
	
	function getNoteRange(start, end) {
		
	}
	
	function removeNoteFromDOM(Note) {
		Notes.removeChild(Note);
	};
	
	function unsaveNote(Note) {
		
		var notes = JSON.parse(window.localStorage.getItem('notes'));
		var id = parseInt(getNoteId(Note));
		notes = notes.filter(function(note) {
			return note.id !== id;
		});
		
		window.localStorage.setItem('notes', JSON.stringify(notes));
		
	};
	
	function removeGridRow() {
		for (var i = 0; i < notesPerRow; i++) {
			var last = PosGrid.lastChild;
			PosGrid.removeChild(last);
		};
	};
	
	function isLastGridRowEmpty() {
		var isEmpty = true;
		var lastId = getLastGridId();
		for (var i = 0; i < notesPerRow; i++) {
			var Cell = PosGrid.querySelector('.cell[data-gridid="' + (lastId - i) + '"]')
			if (Cell.dataset.full === "true") isEmpty = false;
			if (!isEmpty) break;
		};
		return isEmpty;
	};
	
	function removeEmptyGridRows() {
		var isEmpty = null;
		do {
			isEmpty = isLastGridRowEmpty();
			if (isEmpty) {
				removeGridRow();
			}
		} while (isEmpty)
	};
	
	function fillCell(position) {
		var Cell = PosGrid.querySelector('[data-gridid="' + position + '"]');
		Cell.setAttribute('data-full', 'true');
	};
	
	function unfillCell(position) {
		var Cell = PosGrid.querySelector('[data-gridid="' + position + '"]');
		Cell.setAttribute('data-full', 'false');
	};
	
    // Adding Notes ----------------------------------
    function createNote() {
        
        if (NoteBody.innerText === '' && NoteTitle.innerText === '') return;
		
        var body = NoteBody.innerHTML;
        var title = NoteTitle.innerHTML;
		
        resetNoteAdder();
		
        var note = {
            
            id: id,
			position: null,
            title: title,
            body: body
			
        };
		
		id++;
		position++;
		
        addNoteToDOM(note);
        saveNote(note);
    };
    
    DoneButton.addEventListener('click', createNote);
    
    function resetNoteAdder() {
        NoteTitle.innerHTML = ''
        NoteTitle.classList = 'title-placeholder'
        NoteBody.innerHTML = '';
        NoteBody.classList = 'body-placeholder'
    };
    
    function addNoteToDOM(note) {
        
        var Note = createNoteNode(note);
		
        Notes.appendChild(Note);
		
        positionNote(Note);

    };
	
	function getNoteHeight(Note) {
		return Math.floor(Note.offsetHeight / defaultNoteHeight);
	};
	
	function getFirstOpenCell() {
		var Cells = PosGrid.querySelectorAll('.cell');
		for (var i = 0; i < Cells.length; i++) {
			if (Cells[i].dataset.full === "false") return Cells[i];
		};
		return null;
	};
	
    function positionNote(Note, event) {
		
		var Cell = getFirstOpenCell();
		if (Cell === null) {
			addGridRow();
			Cell = getFirstOpenCell();
		};
		
		Cell.dataset.full = "true";
		var position = Cell.dataset.gridid;
		
		var top = Math.floor(position/notesPerRow) * cellHeight + 'px';
		var left = (position % notesPerRow) * cellWidth + 'px';
		
		Note.style.left = left;
		Note.style.top = top;
		
		var prevPosition = Note.getAttribute('data-position');
		if (prevPosition !== 'null') {
			unfillCell(prevPosition);
			unfillCellsBelow(Note);
		};

		Note.setAttribute('data-position', position);
		
		fillCellsBelow(Note);
		
		// save data
		var notes = JSON.parse(window.localStorage.notes);
		var note = notes.filter(function(note) {
			return note.id === parseInt(Note.getAttribute('id'));
		});
		note.position = position;
		window.localStorage.setItem('notes', JSON.stringify(notes));
    };
	
	function unfillCellsBelow(Note) {
		var height = Note.getBoundingClientRect().height;
		var heightRatio = Math.round(height/cellHeight);
		var position = parseInt(Note.dataset.position);
		for (var i = 1; i < heightRatio; i++) {
			var positionBelow = position + (notesPerRow*i);
			var CellBelow = getCellByPosition(positionBelow);
			if (CellBelow === null) {
				continue;
			};
			unfillCell(positionBelow);	
		};
	};
	
	function fillCellsBelow(Note) {
		var height = Note.getBoundingClientRect().height;
		var numCells = Math.round(height/cellHeight);
		var position = parseInt(Note.dataset.position);
		for (var i = 1; i < numCells; i++) {
			var positionBelow = parseInt(position) + (notesPerRow*i);
			var CellBelow = getCellByPosition(positionBelow);
			if (CellBelow === null) {
				addGridRow();
			};
			fillCell(positionBelow);	
		};	
	};
	
	function getCellByPosition(position) {
		return PosGrid.querySelector('.cell[data-gridid="' + position + '"]');
	};
    
    function createNoteNode(note) {

        var Note = document.createElement('div');
        Note.id = 'note' + note.id;
        Note.className = 'note';
		
        
		var NoteTitle = document.createElement('div');
		note.title ? NoteTitle.innerHTML = note.title : NoteTitle.innerHTML = '';
		NoteTitle.innerHTML = note.title;
		NoteTitle.className = 'title';
		Note.appendChild(NoteTitle);
        
		var NoteBody = document.createElement('div');
		note.body ? NoteBody.innerHTML = note.body : NoteBody.innerHTML = '';
		NoteBody.className = 'body';
		Note.appendChild(NoteBody);
        
        var buttonBar = createButtonBarNode();
        Note.appendChild(buttonBar);
        
		var PhotoInput = document.createElement('input');
		PhotoInput.className = 'photo-input';
		PhotoInput.setAttribute('type', 'file');
		PhotoInput.setAttribute('style', 'display:none');
		PhotoInput.addEventListener('change', handlePhotoUpload);
		Note.appendChild(PhotoInput);

		Note.setAttribute('draggable', 'true');
		Note.setAttribute('data-position', note.position);
		
		Note.addEventListener('click', showNoteUpdater);
		Note.addEventListener('mouseover', showFullNote); // on window object
        Note.addEventListener('mouseout', function(e) {
			hideFullNote.apply(this);
			dragFlag = 0;
			clickFlag = 0;
		});
		Note.addEventListener('dragstart', onNoteDragStart);
		Note.addEventListener('dragend', onNoteDragEnd);
		
		return Note;
	};
	
	// Updating Notes ------------------------------------------------------------
	
	function updateNoteInDOM(Note) {

		var title = NoteUpdater.querySelector('.title').innerHTML;
		var body = NoteUpdater.querySelector('.body').innerHTML;
		
		var NoteTitle = Note.querySelector('.title');
		NoteTitle.innerHTML = title;
		
		var NoteBody = Note.querySelector('.body');
		NoteBody.innerHTML = body;
	};
	
	function updateNoteData(id) {

		var notes = JSON.parse(window.localStorage.notes);

		var note = notes.filter(function(note) {
			return note.id === parseInt(id);
		})[0];
		
		var title = NoteUpdater.querySelector('.title').innerHTML;
		var body = NoteUpdater.querySelector('.body').innerHTML;
		
		note.title = title;
		note.body = body;
		
		window.localStorage.setItem('notes', JSON.stringify(notes));
	};
		
	function updateNote() {
		
		var id = NoteUpdater.attributes['data-editing'].value;
		var Note = document.querySelector('#note'+id);
		
		// Note
		updateNoteInDOM(Note);
		updateNoteData(id);
		
	};
	
	NoteUpdater.addEventListener('keyup', updateNote);
	
	function adjustGrid() {
		
		var id = NoteUpdater.attributes['data-editing'].value;
		var Note = document.querySelector('#note'+id);
		var position = parseInt(Note.dataset.position);
		
		// remove all cells below
		var CellBelow = getCellByPosition(position + notesPerRow);
		console.log(CellBelow);
		var i = 1;
		while (CellBelow !== null) {
			console.log(CellBelow);
			unfillCell(CellBelow.dataset.gridid);
			i++;
			CellBelow = getCellByPosition(position + (notesPerRow*i));
		};
										  
		// refill cells
		fillCellsBelow(Note);
		
	};
		
	NoteUpdater.addEventListener('keyup', function(e) {
		if (e.code === 'Enter' && e.ctrlKey) adjustGrid();
	});
	
	NoteUpdater.querySelector('.done').addEventListener('click', adjustGrid);
	
	// Moving Notes  -------------------------------------------------------------
	var dragged = null;
	function onNoteDragStart(e) {
		dragged = this;
		dragged.style.opacity = '0.5';
		dragged.style.zIndex = '2';
		PosGrid.style.zIndex = '1';
		console.log('yo');
	};
	
	function onNoteDragOver(e) {
		console.log(e.target.dataset.gridid);
		e.preventDefault();
	};
	
	function onNoteDrop(e) {
		e.preventDefault();
		console.log(e.target.dataset.gridid);
	};
	
	function onNoteDragEnd(e) {
		dragged.style.opacity = '';
		dragged.style.zIndex = '';
		dragged = null;
		PosGrid.style.zIndex = '';
	};
	
	document.querySelector('#note-updater-wrapper').addEventListener('drop', onNoteDrop);
	PosGrid.addEventListener('dragover', onNoteDragOver);
	PosGrid.addEventListener('drop', onNoteDrop);
	
	function handlePhotoUpload(e) {
		
		var file = e.target.files.item(0);
		var imageType = /^image\//;
		
		if (!imageType.test(file.type)) {
			alert('Please upload a picture');
		} else {
			var noteBody = e.target.parentElement.querySelector('.body');
			var img = document.createElement('img');
			img.className = 'body-image';
			img.file = file;
			noteBody.appendChild(img);

			var fr = new FileReader();
			fr.onload = (function(img) {
				return function(e) {
					img.src = e.target.result;
				};
			})(img);

			fr.readAsDataURL(file);
		};		
	}
    
    function createButtonBarNode() {
        var buttonBar = document.createElement('ul');
        buttonBar.className = 'note-button-bar';
                
        var imageButton = document.createElement('li');
        imageButton.className='add-image-button note-button';
		imageButton.addEventListener('click', uploadPhoto);
        
       var imageButtonIcon = document.createElement('i');
        imageButtonIcon.className = 'fa fa-file-image-o note-button';
        imageButton.appendChild(imageButtonIcon);
        
        buttonBar.appendChild(imageButton);

        var colorButton = document.createElement('li');
        colorButton.className='change-color-button note-button';
        
       var colorButtonIcon = document.createElement('i');
        colorButtonIcon.className = 'fa fa-gear note-button';
        colorButton.appendChild(colorButtonIcon);
        
        buttonBar.appendChild(colorButton);

        var archiveButton = document.createElement('li');
        archiveButton.className='archive-note-button note-button';
        
       var archiveButtonIcon = document.createElement('i');
        archiveButtonIcon.className = 'fa fa-archive note-button';
		archiveButtonIcon.addEventListener('click', deleteNote); //event listener
        archiveButton.appendChild(archiveButtonIcon);

        buttonBar.appendChild(archiveButton);
                
        return buttonBar;
    };
	
	function uploadPhoto(e) {
		e.stopImmediatePropagation();
		var note = e.target.offsetParent;
		var photoInput = note.querySelector('.photo-input');
		photoInput.addEventListener('click', function(e) {
			e.stopImmediatePropagation();
		})
		photoInput.click();
		
	};
	
	AddImageButtons.forEach(function(button) {
		button.addEventListener('click', uploadPhoto);
	})
    
	function saveNote(note) {
		if (typeof(Storage) !== 'undefined') {
			if (window.localStorage.notes === undefined) {
				window.localStorage.setItem('notes',JSON.stringify([note]));
			} else {
				var notes = JSON.parse(window.localStorage.notes);
				notes.push(note);
				window.localStorage.setItem('notes', JSON.stringify(notes));
			};
		} else {
			alert('Your browser is too old. We can\'t save your notes across sessions');
		};
	};
	
    function saveNote_old(note) {
		var http = new XMLHttpRequest();
		var url = 'http://localhost:3000/note/' + note.id;
		var params = objectToParamString(note);
		
		console.log(params);
		
		http.open("POST", url, true);

		//Send the proper header information along with the request
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		http.onreadystatechange = function() {//Call a function when the state changes.
			if(http.readyState == 4 && http.status == 200) {
				alert(http.responseText);
			}
		}
		http.send(params);
    };
    
	// Download Notes Data -------------------------------
	
	var DownloadNotesButton = document.querySelector('#download-notes');
	
	function downloadNotesData() {
		var element	= document.createElement('a');
		var notes = getNotesData();
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(notes));
		element.setAttribute('download', 'notes.json');
		element.setAttribute('type', 'application/json');
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	};
	
	DownloadNotesButton.addEventListener('click', downloadNotesData);
	
	function getNotesData() {
		return window.localStorage.notes;
	};
	
	// Upload Notes Data ---------------------------------
	
	var UploadNotesButton = document.querySelector('#upload-notes');
	
	function handleNotesDataUpload(e) {		
		
		var file = e.target.files.item(0);

		var fr = new FileReader();
		fr.onload =  function(e) {
			var notes = JSON.parse(e.target.result);
			notes.forEach(function(note) {
				
				// Update DOM
				var Note = document.querySelector('#note'+note.id);
				if (Note) {
					var Title = Note.querySelector('.title');
					Title.innerHTML = note.title;
					var Body = Note.querySelector('.body');
					Body.innerHTML = note.body;
				} else {
					addNoteToDOM(note);
				}
				
				// Save Notes Data
				window.localStorage.setItem('notes', JSON.stringify(notes));
			});
		};

		fr.readAsText(file);
	}
	
	function uploadNotesData() {
		var NotesDataInput = document.createElement('input');
		NotesDataInput.className = 'notes-data-input';
		NotesDataInput.setAttribute('type', 'file');
		NotesDataInput.setAttribute('style', 'display:none');
		NotesDataInput.addEventListener('change', handleNotesDataUpload);
		document.body.appendChild(NotesDataInput);
		NotesDataInput.click();
	};
	
	UploadNotesButton.addEventListener('click', uploadNotesData);
	
	// Utilities -----------------------------------------
	
    function objectToParamString(obj) {
		var paramString = '';
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				paramString += key + '=' + obj[key] + '&';	
			}
		};
		if (paramString) paramString = paramString.slice(0, -1);
		return paramString;
	};
	
}(window));