(function(root) {
    
    var NoteAdder = document.querySelector('#note-adder');
    
    var NoteTitle = NoteAdder.querySelector('#note-title');
    
    var NoteButtons = NoteAdder.querySelector('.note-button-bar');
    
    var NoteBody = NoteAdder.querySelector('#note-body');
	
	var MenuButton = document.querySelector('#menu-button');
	
	var Menu = document.querySelector('#menu');
	
	var HelpButton = document.querySelector('#help-button');
	
	var Help = document.querySelector('#help')
	
	// Help ---------------------------------------------
	
	function toggleHelp() {
		if (Help.style.zIndex === '100') {
			Help.style.zIndex = -100;
			Help.style.background = 'rgba(229, 229, 229, 0)';
			Help.style.opacity = '0';	
		} else {
			Help.style.zIndex = 100;
			Help.style.background = 'rgba(229, 229, 229, 0.7)';
			Help.style.opacity = '1';
		};
	};
	
	HelpButton.addEventListener('click', toggleHelp);
	Help.addEventListener('click', function(e) {
		if (e.target === this) toggleHelp();
	})
	root.toggleHelp = toggleHelp;
	
	// MenuButton ----------------------------------------
	
	function toggleMenu() {
		if (Menu.style.left === '0px') { 
			Menu.style.left = '-312px';
		} else {
			Menu.style.left = '0px';
		};
	};
	
	MenuButton.addEventListener('click', toggleMenu);
    
    // NoteAdder - show and hide Stuff -------------------
    
    function toggleFullNoteAdder(e) {
        var shouldHide = true;
        NoteAdder.childNodes.forEach(function(child) {

            if (child === e.target) {
                shouldHide = false;
                NoteTitle.style.display = 'block';
                NoteButtons.style.display = 'block';
            };
            
        });
        
        NoteButtons.childNodes.forEach(function(child) {

            if (child === e.target) {
                shouldHide = false;
                NoteTitle.style.display = 'block';
                NoteButtons.style.display = 'block';
            };
            
            child.childNodes.forEach(function(child) {
                
                if (child === e.target) {
                    shouldHide = false;
                    NoteTitle.style.display = 'block';
                    NoteButtons.style.display = 'block';
                };
                
            })
            
        });
        
        if (shouldHide) {
            NoteTitle.style.display = 'none';
            NoteButtons.style.display = 'none';
        };
    };
    
    window.addEventListener('click', toggleFullNoteAdder);
    
    // Note - show and hide stuff --------------------
    
    var Notes = document.querySelectorAll('.note');
    
    var showFullNote = function(e) { //TODO - get the index and the place where the mouse enters to mimic the Google Keep magical little wave on entry
        this.querySelectorAll('.note-button-bar li').forEach(function(li) {
            li.style.opacity = '1';
        });
    };
    
    var hideFullNote = function(e) {
        this.querySelectorAll('.note-button-bar li').forEach(function(li) {
            li.style.opacity = '0';
        });    
    };
    
    Notes.forEach(function(note) {
       note.addEventListener('mouseover', showFullNote); 
       note.addEventListener('mouseout', hideFullNote); 
    });
    
    root.showFullNote = showFullNote;
    
    // Note Updater - show and hide and update data -------------------
    
    var NoteUpdaterWrapper = document.querySelector('#note-updater-wrapper');
    var NoteUpdater = NoteUpdaterWrapper.querySelector('#note-updater');
	var Title = NoteUpdater.querySelector('.title');
	var Body = NoteUpdater.querySelector('.body');
	
	function showNoteUpdater(e) {
		
		// hide the note we clicked
		this.style.opacity = 0;
		
		// get the note's data
		var id = getNoteId(this);
		var title = getNoteTitle(this);
		var body = getNoteBody(this);
		
		// fill in the NoteUpdater
		Title.innerHTML = title;
		Body.innerHTML = body;
		
		// allow editing
		Title.setAttribute('contenteditable', 'true');
		Body.setAttribute('contenteditable', 'true');
		
		// add placeholders if needed
		if (title === '') {
			Title.setAttribute('class', 'title title-placeholder');
 		};
		
		if (body == '') {
			Body.setAttribute('class', 'body body-placeholder');
 		};
		
		// remove placeholders when there is content
		
		// show NoteUpdater
		NoteUpdaterWrapper.style.zIndex = 1001;
		NoteUpdaterWrapper.style.background = 'rgba(229, 229, 229, 0.7)';
		NoteUpdater.style.opacity = '1';
		
		// track which note we're editing
		NoteUpdater.setAttribute('data-editing', id);
		
		// Move the cursor into the box
		NoteUpdater.querySelector('.body').focus();
		
	};
	
	root.showNoteUpdater = showNoteUpdater;
	
	function hideNoteUpdater() {
		
		// make content not editable
		NoteUpdater.querySelector('.title').setAttribute('contenteditable', 'false');
		NoteUpdater.querySelector('.body').setAttribute('contenteditable', 'false');
		
		// show the note again
		var id = NoteUpdater.getAttribute('data-editing');
		var note = document.querySelector('#note'+id);
		note.style.opacity = 1;
		
		// hide NoteUpdater
		NoteUpdaterWrapper.style.zIndex = -100;
		NoteUpdaterWrapper.style.background = 'rgba(229, 229, 229, 0)';
		NoteUpdater.style.opacity = '0';
	};
	
	root.hideNoteUpdater = hideNoteUpdater;
	
	NoteUpdater.addEventListener('keyup', function(e) {
		if (e.code === 'Enter' && e.ctrlKey) hideNoteUpdater();
	});
	
	NoteUpdater.querySelector('.done').addEventListener('click', hideNoteUpdater);
	
	NoteUpdaterWrapper.addEventListener('mousedown', function(e) {
		if (e.target === NoteUpdaterWrapper) hideNoteUpdater();
	});	
	
	var handlePlaceholderFactory = function(field) {
		return function(e) {
			if (this.innerHTML === '') {
				var classString = field + ' ' + field + '-placeholder';
			} else {
				var classString = field;
			};
			
			this.setAttribute('class', classString);
		};
	};
	
	var handleTitlePlaceholder = handlePlaceholderFactory('title');
	var handleBodyPlaceholder = handlePlaceholderFactory('body');

	Title.addEventListener('keyup', handleTitlePlaceholder);
	Body.addEventListener('keyup', handleBodyPlaceholder);
	
	function getNoteId(note) {
		return note.id.slice(4);
	};
	
	window.getNoteId = getNoteId;
		
	function getNoteTitle(note) {
		return getNoteField.call(null, note, 'title');
	};
	
	function getNoteBody(note) {
		return getNoteField.call(null, note, 'body');
	};
	
	function getNoteField(note, field) {

		var classForField = '.' + field;
		
		var value = '';

		try {
			value = note.querySelector(classForField).innerHTML;
		} catch(e) {
			// console.warn(e);
		};
		
		return value;
	};
	
	root.showNoteUpdater = showNoteUpdater;
	Notes.forEach(function(note) {
		note.addEventListener('click', function(e) {
			if(e.target.parentElement === note) showNoteUpdater.bind(this)(e);
		});
	});
	
	function toggleFullScreen() {
		NoteUpdater.className === 'fullscreen' ? NoteUpdater.className = '' : NoteUpdater.className = 'fullscreen';
	};
	
	var expandButtons = document.querySelectorAll('.expand-button');
	expandButtons.forEach(function(button) {
		button.addEventListener('click', toggleFullScreen);
	});	
    
}(window));