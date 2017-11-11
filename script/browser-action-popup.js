$(document).ready(function(){
    //Assign function to Plus
    $(".popup-new-item-a").mouseenter(function(){
        $(".popup-new-item").css("background-color", "grey");
    });
    $(".popup-new-item-a").mouseleave(function(){
        $(".popup-new-item").css("background-color", "#555");
    });

    $(".popup-new-item-a").click(function(){
        if (!mainWindow.addNewItemWindow){
            addNewItemHelper.addNewItem($(".popup-body"), addNewItemHelper.new,-1);
        }        
    });

    //Assign function to popup
    $("#popup-btn-seperate").click(function(){ 
        var win = window.open('/webpage/browser-action-popup.html');
        if (win) {
            //Browser has allowed it to be opened
            win.focus(); //Focus on the new web page
            window.close(); //Close the current one
        } else {
            //Browser has blocked it
        }
    });

    //Assign Function to Home
    $("#popup-btn-home").click(function(){ 
        var thisInstance = $(this);
        if (thisInstance.hasClass('active')) return;

        $("#popup-btn-tools").removeClass('active');
        thisInstance.addClass("active");
        var topBar = $('#popup-search-top-bar');
        topBar.css('display','table');
        var content = $('#popup-home-content');
        content.css('display','block');
        var topBar2 = $('#popup-setting-top-bar');
        topBar2.css('display','none');
        var content2 = $('#popup-setting-content');
        content2.css('display','none');
    });

    //Assign Function to Settings/Tools
    $("#popup-btn-tools").click(function(){ 
        var thisInstance = $(this);
        if (thisInstance.hasClass('active')) return;
        
        $("#popup-btn-home").removeClass("active");
        thisInstance.addClass("active");

        var topBar = $('#popup-search-top-bar');
        topBar.css('display','none');
        var content = $('#popup-home-content');
        content.css('display','none');
        var topBar2 = $('#popup-setting-top-bar');
        topBar2.css('display','table');
        var content2 = $('#popup-setting-content');
        content2.css('display','block');

    });

});

//Collection of global var
var mainWindow = {
    pushNotification: function (messageString, notificationType, seconds){

        $.notify({
            // options
            icon: 'fa fa-info-circle',
            title: '',
            message: messageString,
            type: 'info'
        },{
            // settings
            element: 'body',
            position: null,
            type: "info",
            allow_dismiss: true,
            newest_on_top: false,
            showProgressbar: false,
            placement: {
                from: "bottom",
                align: "right"
            },
            offset: {
             x: 10,
             y: 65  
            },
            spacing: 10,
            z_index: 1031,
            delay: 3000,
            timer: 1000,
            url_target: '_blank',
            mouse_over: 'pause',
            animate: {
                enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
            },
            onShow: null,
            onShown: null,
            onClose: null,
            onClosed: null,
            icon_type: 'class',
            template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert" style="width:50%;">' +
                '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">x</button>' +
                '<span data-notify="icon"></span> ' +
                '<span data-notify="title">{1}</span> ' +
                '<span data-notify="message">{2}</span>' +
                '<div class="progress" data-notify="progressbar">' +
                    '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                '</div>' +
                '<a href="{3}" target="{4}" data-notify="url"></a>' +
            '</div>' 
        });
    },

    saveData:function(url,name,username,password,note,favicon){
        mainWindow.saveDataWithIndex(url,name,username,password,note,favicon,this.recordList.length);
    },

    saveDataWithIndex:function(url,name,username,password,note,favicon,index){
        if (!favicon){
            favicon = mainWindow.deafultFavIconURL;
        }

        var obj = {url,name,username,password,note,favicon}
        this.recordList[index] = obj;

        mainWindow.recordList.sort(function(a,b){ //Sort it
            var textA = a.name.toUpperCase();
            var textB = b.name.toUpperCase();

            var textC = a.username.toUpperCase();
            var textD = b.username.toUpperCase();
            if (textA < textB) return -1;
            else if (textA > textB) return 1;
            else if (textC < textD) return -1;
            else if (textC > textD) return 1;
            else return 0;
        });

        browser.storage.sync.set({
            recordList:  mainWindow.encryptList(mainWindow.recordList)
        });

        mainWindow.manualSyncUpdate();
    },

    saveDataAll(){
        browser.storage.sync.set({
            recordList:  mainWindow.encryptList(mainWindow.recordList)
        });
    },

    deleteDataByIndex:function(index){
        mainWindow.recordList.splice(index,1);

        browser.storage.sync.set({
            recordList:  mainWindow.encryptList(mainWindow.recordList)
        });

        mainWindow.manualSyncUpdate();
    },

    encryptList(recordList){
        // var encryptList = CryptoJS.AES.encrypt(JSON.stringify(recordList),this.masterKey).toString();

        var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(recordList),this.masterKey);

        return ciphertext.toString();
    },

    decrpytList(encrpytList){
        // console.log('Decrypting List '+ encrpytList);
        if (!encrpytList) return encrpytList;

            // Decrypt
            var bytes  = CryptoJS.AES.decrypt(encrpytList, this.masterKey);
            var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        // console.log('Decrpyted List' + decryptedData);

        return decryptedData;
    },

    manualSyncUpdate(){ //Sometime the onchange listner is broken
        // mainWindow.recordList.sort(function(a,b){
        //     var textA = a.name.toUpperCase();
        //     var textB = b.name.toUpperCase();

        //     var textC = a.username.toUpperCase();
        //     var textD = b.username.toUpperCase();
        //     if (textA < textB) return -1;
        //     else if (textA > textB) return 1;
        //     else if (textC < textD) return -1;
        //     else if (textC > textD) return 1;
        //     else return 0;
        // });

        mainPageHelper.loadMainPage(mainWindow.recordList);

        // mainWindow.storageChangedListener('',mainWindow.recordList);
    },

    storageChangedListener:function(changes, area) {
        // console.log('storage changed');
        var changedItems = Object.keys(changes);
       
        for (var item of changedItems) {
            mainWindow.recordList = mainWindow.decrpytList(changes[item].newValue);
        }

        mainPageHelper.loadMainPage(mainWindow.recordList);
    },

    addNewItemWindow:null,
    addNewItemView:null,
    addNewItemEdit:null,

    //Colors
    colorPrimary1: "#555",
    colorPrimary2: "gainsboro",
    colorGreen: "#007000",
    colorGreenLight: "#008000",
    colorWhiteDarken:"#F5F5F5",
    colorBlackWhiten:"#202020",
    colorSectionLineGrey:"#ddd",

    //Font Size
    fontSizeWindowTitle: '16px',

    //Master Key
    masterKey :"masterkey",

    //All of the record
    recordList: [],

    deafultFavIconURL:'/icons/favicon-32x32.png',
    currentPageFavIconURL:null,
    currentPageURL:null,
    currentPageTitle:null,

    serachInput:null,
    searchEmptyDiv:null,
    hiddenInputField:null,

    reintialize:function(){ //Load before dom is ready
        //Load storage area
        var ywzPMStorage = browser.storage.sync.get(
            {
                recordList: mainWindow.encryptList([])
            }
        );
        ywzPMStorage.then(function(item){
            // console.log('Loading Storage from sync');
            // console.log(item.recordList);
            if (item){
                mainWindow.recordList = mainWindow.decrpytList(item.recordList);
            }
        
            mainWindow.manualSyncUpdate();
            // mainPageHelper.loadMainPage(mainWindow.recordList);
            browser.storage.onChanged.addListener(mainWindow.storageChangedListener);
        },
        function(error){
            console.log(error)
        
            mainWindow.manualSyncUpdate();
            // mainPageHelper.loadMainPage(mainWindow.recordList);
            browser.storage.onChanged.addListener(mainWindow.storageChangedListener);
        });
    }
};

mainWindow.preintialize();

var mainPageHelper ={
    //Currently
    contentHead: null,
    mainPageContent:null,
  
      loadMainPage:function(recordList){
        //TO BE IMPLEMENTED ... Load the main page of the extension
      },

        //Generate Generic Window Header
        generateMainPageHeader: function(headerStr, leftHandFunction, rightHandFunction, leftHandIconClass, rightHandIconClass){
            var addNewItemHeader=$('<div></div>'); //Create Header
            addNewItemHeader.css('height',"45px");
            addNewItemHeader.css('width',"100%");
            addNewItemHeader.css('background-color',"#555");
            addNewItemHeader.css('color',"white");
    
            var addNewItemCancel=$("<div></div>"); //Create Cancel Section
            addNewItemCancel.click(leftHandFunction);
    
            addNewItemCancel.hover(function () {
                addNewItemCancel.css('background-color','grey');
            }, function () {
                addNewItemCancel.css('background-color',mainWindow.colorPrimary1);
            });
            addNewItemCancel.css('height','100%');
            addNewItemCancel.css('width','10%');
            addNewItemCancel.css('display','flex');
            addNewItemCancel.css('justify-content','center');
            addNewItemCancel.css('align-items','center');
            addNewItemCancel.css('cursor','pointer');
            addNewItemCancel.css('float','left');
            addNewItemCancel.attr('title','Cancel');
        
            var addNewItemCancelLabel=$("<i></i>"); //Create Cancel Label
            addNewItemCancelLabel.addClass("fa");
            addNewItemCancelLabel.addClass("fa-times");
            addNewItemCancelLabel.css('text-align','center');
            addNewItemCancelLabel.css('font-size','24px');
        
            addNewItemCancel.append(addNewItemCancelLabel);
        
            var addNewItemWindowTitle=$('<div></div>');//Create Window Title
            addNewItemWindowTitle.css('float','left');
            addNewItemWindowTitle.css('width','80%');
            addNewItemWindowTitle.css('height','100%');
            addNewItemWindowTitle.css('display','flex');
            addNewItemWindowTitle.css('text-align','center');
            addNewItemWindowTitle.css('justify-content','center');
            addNewItemWindowTitle.css('align-items','center');
            var titleBarLabelStr = headerStr;
            var addNewItemWindowTitleLabel=$('<span><b>'+ titleBarLabelStr +'</b></span>');//Create Window Title Label
            addNewItemWindowTitleLabel.css('color','white');
            addNewItemWindowTitleLabel.css('font-size',mainWindow.fontSizeWindowTitle);
            addNewItemWindowTitle.append(addNewItemWindowTitleLabel);
    
            var addNewSave=$('<div></div>');
            addNewSave.click(rightHandFunction);
            addNewSave.hover(function () {
                addNewSave.css('background-color',mainWindow.colorGreenLight);
            }, function () {
                addNewSave.css('background-color',mainWindow.colorGreen);
            });
            addNewSave.css('background-color',mainWindow.colorGreen);
            addNewSave.css('width','10%');
            addNewSave.css('height','100%');
            addNewSave.css('display','flex');
            addNewSave.css('text-align','center');
            addNewSave.css('justify-content','center');
            addNewSave.css('align-items','center');
            addNewSave.css('float','left');
            addNewSave.css('cursor','pointer');
            var addNewSaveLabel = $('<i></i>');
            addNewSaveLabel.addClass("fa");
            addNewSaveLabel.addClass(rightHandIconClass);
            addNewSaveLabel.css('text-align','center');
            addNewSaveLabel.css('font-size','24px');
            addNewSave.append(addNewSaveLabel);
    
            if (leftHandFunction){
                addNewItemHeader.append(addNewItemCancel);
            }
    
            addNewItemHeader.append(addNewItemWindowTitle);
    
            if (rightHandFunction){
                addNewItemHeader.append(addNewSave);
            }
    
            if (!leftHandFunction && !rightHandFunction){
                addNewItemWindowTitle.css('width','100%');
            }
    
            return addNewItemHeader;
        }
}

//Add New Item Section
var addNewItemHelper = {
    //cache of id
    urlInputId:"URL",
    nameInputId:"NameInput",
    usernameInputId:"UserNameInput",
    passwordInputId:"PasswordInput",
    noteInputId:"NoteInput",
    divId:"FormInput",
    favIconId:"FavIconInputURL",

    //Cahce of favicon
    favicon:null,

    //Type of Window
    new:1,
    edit:2,
    view:3,

    //Generate new item section
    addNewItem: function (parent,type,index){
        if (type===addNewItemHelper.new){
            if (!mainWindow.addNewItemWindow);
            else return;
        }
        else if (type===addNewItemHelper.edit){
            if (!mainWindow.addNewItemEdit);
            else return;
        }
        else{
            if (!mainWindow.addNewItemView);
            else return;
        }

        var inputBool = true;
        if (type===addNewItemHelper.new){
            inputBool = false;

            mainWindow.getTabsInfo(function(windowInfo){
                tabInfo = windowInfo.tabs;
                for (var i = 0; i < windowInfo.tabs.length; i++) {
                    if(!tabInfo[i].active) continue;
                    mainWindow.currentPageURL = tabInfo[i].url;
                    mainWindow.currentPageTitle = tabInfo[i].title;
                    mainWindow.currentPageFavIconURL = tabInfo[i].favIconUrl;
                    break;
                }
            })
        }
        else if (type===addNewItemHelper.edit){
            inputBool = false;
        }

        //Add New Item Page
        //Slide up animation to cover the parent
        var addNewItemDivId="AddNewItemID";
    
        var addNewItemDiv=$('<div></div>'); //Create top-level div
        addNewItemDiv.attr('id',addNewItemDivId);
        addNewItemDiv.css('position','absolute');
        addNewItemDiv.css('width','100%');
        addNewItemDiv.css('height','100%');
        addNewItemDiv.css('background-color','gainsboro');
        if (type == addNewItemHelper.new)
            addNewItemDiv.css('z-index','999');
        else if (type == addNewItemHelper.view){
            addNewItemDiv.css('z-index','1000');
        }
        else if (type == addNewItemHelper.edit){
            addNewItemDiv.css('z-index','1001');
        }
        addNewItemDiv.css("top","100%");
        addNewItemDiv.css("transition","all .4s ease-out");
        //addNewItemDiv.css();
    
        //
        var addNewItemHeader=$('<div></div>'); //Create Header
        addNewItemHeader.css('height',"45px");
        addNewItemHeader.css('width',"100%");
        addNewItemHeader.css('background-color',"#555");
        addNewItemHeader.css('color',"white");
        addNewItemDiv.append(addNewItemHeader);
    
        var addNewItemCancel=$("<div></div>"); //Create Cancel Section
        addNewItemCancel.click(function () {
            if (type === addNewItemHelper.view)
                mainWindow.addNewItemView.css('top','100%');
            else if (type === addNewItemHelper.edit)
                mainWindow.addNewItemEdit.css('top','100%');
            else
                mainWindow.addNewItemWindow.css('top','100%');

            setTimeout(function(){
                if (type === addNewItemHelper.view){
                    mainWindow.addNewItemView.remove();
                    mainWindow.addNewItemView = null;
                }
                else if (type === addNewItemHelper.edit){
                    mainWindow.addNewItemEdit.remove();
                    mainWindow.addNewItemEdit = null;

                    mainWindow.addNewItemView
                }
                else{
                    mainWindow.addNewItemWindow.remove();
                    mainWindow.addNewItemWindow = null;
                }
            }, 410);
        });

        addNewItemCancel.hover(function () {
            addNewItemCancel.css('background-color','grey');
        }, function () {
            addNewItemCancel.css('background-color',mainWindow.colorPrimary1);
        });
        addNewItemCancel.css('height','100%');
        addNewItemCancel.css('width','10%');
        addNewItemCancel.css('display','flex');
        addNewItemCancel.css('justify-content','center');
        addNewItemCancel.css('align-items','center');
        addNewItemCancel.css('cursor','pointer');
        addNewItemCancel.css('float','left');
        addNewItemCancel.attr('title','Cancel');
    
        var addNewItemCancelLabel=$("<i></i>"); //Create Cancel Label
        addNewItemCancelLabel.addClass("fa");
        addNewItemCancelLabel.addClass("fa-times");
        addNewItemCancelLabel.css('text-align','center');
        addNewItemCancelLabel.css('font-size','24px');
    
        addNewItemCancel.append(addNewItemCancelLabel);
        addNewItemHeader.append(addNewItemCancel);
    
        var addNewItemWindowTitle=$('<div></div>');//Create Window Title
        addNewItemWindowTitle.css('float','left');
        addNewItemWindowTitle.css('width','80%');
        addNewItemWindowTitle.css('height','100%');
        addNewItemWindowTitle.css('display','flex');
        addNewItemWindowTitle.css('text-align','center');
        addNewItemWindowTitle.css('justify-content','center');
        addNewItemWindowTitle.css('align-items','center');
        var titleBarLabelStr = '';
        if (type===addNewItemHelper.new){
            titleBarLabelStr = 'Add New Account Info';
        }
        else if (type===addNewItemHelper.view){
            titleBarLabelStr = 'View Content';
        }
        else if (type === addNewItemHelper.edit){
            titleBarLabelStr = 'Edit Content';
        }
        var addNewItemWindowTitleLabel=$('<span><b>'+ titleBarLabelStr +'</b></span>');//Create Window Title Label
        addNewItemWindowTitleLabel.css('color','white');
        addNewItemWindowTitleLabel.css('font-size',mainWindow.fontSizeWindowTitle);
        addNewItemWindowTitle.append(addNewItemWindowTitleLabel);
    
        var addNewSave=$('<div></div>');
        addNewSave.click(function () {
            if (type==addNewItemHelper.new){ //Save New Record
                var targetDiv = $('#'+addNewItemHelper.divId);
                var faviconSource = targetDiv.find('#'+addNewItemHelper.favIconId).val();
                if (faviconSource === ''){
                    faviconSource = mainWindow.deafultFavIconURL;
                }

                mainWindow.saveDataWithIndex(targetDiv.find('#'+addNewItemHelper.urlInputId).val(),targetDiv.find('#'+addNewItemHelper.nameInputId).val(),targetDiv.find('#'+addNewItemHelper.usernameInputId).val(),
                targetDiv.find('#'+addNewItemHelper.passwordInputId).val(), targetDiv.find('#'+addNewItemHelper.noteInputId).val(),faviconSource, index);


                mainWindow.pushNotification('New Record Saved');
            }
            else if (type==addNewItemHelper.edit){
                var targetDiv = mainWindow.addNewItemEdit;
                var faviconSource = targetDiv.find('#'+addNewItemHelper.favIconId).val();
                if (faviconSource === ''){
                    faviconSource = mainWindow.deafultFavIconURL;
                }

                mainWindow.saveDataWithIndex(targetDiv.find('#'+addNewItemHelper.urlInputId).val(),targetDiv.find('#'+addNewItemHelper.nameInputId).val(),targetDiv.find('#'+addNewItemHelper.usernameInputId).val(),
                targetDiv.find('#'+addNewItemHelper.passwordInputId).val(), targetDiv.find('#'+addNewItemHelper.noteInputId).val(),faviconSource, index);


                mainWindow.pushNotification('Record Edited');  
            }
            else if (type==addNewItemHelper.view){
                addNewItemHelper.addNewItem($(".popup-body"), addNewItemHelper.edit, index);
            }

            if (type === addNewItemHelper.view)
                //mainWindow.addNewItemView.css('top','100%');
                ;
            else if (type === addNewItemHelper.edit){
                var item = mainWindow.recordList[index];
                
                mainWindow.addNewItemView.find('#'+addNewItemHelper.urlInputId).val(item.url);
                mainWindow.addNewItemView.find('#'+addNewItemHelper.nameInputId).val(item.name);
                mainWindow.addNewItemView.find('#'+addNewItemHelper.usernameInputId).val(item.username);
                mainWindow.addNewItemView.find('#'+addNewItemHelper.passwordInputId).val(item.password);
                mainWindow.addNewItemView.find('#'+addNewItemHelper.noteInputId).val(item.note);

                mainWindow.addNewItemEdit.css('top','100%');
            }
            else
                mainWindow.addNewItemWindow.css('top','100%');

            setTimeout(function(){
                if (type === addNewItemHelper.view){
                }
                else if (type === addNewItemHelper.edit){
                    mainWindow.addNewItemEdit.remove();
                    mainWindow.addNewItemEdit = null;
                }
                else{
                    mainWindow.addNewItemWindow.remove();
                    mainWindow.addNewItemWindow = null;
                }
            }, 500);
        });
        addNewSave.hover(function () {
            addNewSave.css('background-color',mainWindow.colorGreenLight);
        }, function () {
            addNewSave.css('background-color',mainWindow.colorGreen);
        });
        addNewSave.css('background-color',mainWindow.colorGreen);
        addNewSave.css('width','10%');
        addNewSave.css('height','100%');
        addNewSave.css('display','flex');
        addNewSave.css('text-align','center');
        addNewSave.css('justify-content','center');
        addNewSave.css('align-items','center');
        addNewSave.css('float','left');
        addNewSave.css('cursor','pointer');
        var addNewSaveLabel = $('<i></i>');
        addNewSaveLabel.addClass("fa");
        if (type === addNewItemHelper.view){
            addNewSaveLabel.addClass("fa-edit");
            addNewSave.attr('title','Edit');
        }
        else{
            addNewSaveLabel.addClass("fa-check");
            addNewSave.attr('title','Save');
        }
        addNewSaveLabel.css('text-align','center');
        addNewSaveLabel.css('font-size','24px');
        addNewSave.append(addNewSaveLabel);
    
        addNewItemHeader.append(addNewItemWindowTitle);
        addNewItemHeader.append(addNewSave);
    
        //Craete Content (Body)
        var addNewItemContent=$('<div></div>')
        addNewItemContent.css('height',"calc(100% - 45px)");
        addNewItemContent.css('top',"45px");
        addNewItemContent.css('overflow',"auto");
        addNewItemContent.attr('id',this.divId);
        addNewItemDiv.append(addNewItemContent);
    
        var addNewItemForm=$('<div></div>'); //Top-Level form div
        addNewItemContent.append(addNewItemForm);
    
        var addNewItemInfoSection=$('<div></div');//Section Info
        addNewItemInfoSection.addClass('popup-list-section');
        addNewItemInfoSection.append(this.generateContentSectionHeader("Account Information"));
        var addNewItemInfoList=$('<div></div>');
        addNewItemInfoList.css('border-top','2px solid lightgrey');
        addNewItemInfoList.css('border-bottom','2px solid lightgrey');
        addNewItemInfoSection.append(addNewItemInfoList);

        var addNewItemInfoURL = this.generateContentSectionStandardDiv(); //URL of the record
        var addNewItemInfoHeader = this.generateContentSectionStandardHeader("URL");
        var addNewItemInfoURLInput = this.generateContentSectionInputField(this.urlInputId,'text',inputBool);
        addNewItemInfoHeader.append(addNewItemInfoURLInput);
        addNewItemInfoURL.append(addNewItemInfoHeader);
        addNewItemInfoList.append(addNewItemInfoURL);

        var addNewItemInfoName = this.generateContentSectionStandardDiv(); //Name of the record
        var addNewItemInfoNameHeader = this.generateContentSectionStandardHeader("Name");
        var addNewItemInfoNameInput = this.generateContentSectionInputField(this.nameInputId,'text',inputBool);
        addNewItemInfoNameHeader.append(addNewItemInfoNameInput);
        addNewItemInfoName.append(addNewItemInfoNameHeader);
        addNewItemInfoList.append(addNewItemInfoName);

        var addNewItemInfoUserName = this.generateContentSectionStandardDiv();//UserName
        var addNewItemInfoUserNameHeader = this.generateContentSectionStandardHeader('Username');
        var addNewItemInfoUserInput = this.generateContentSectionInputField(this.usernameInputId,'text',inputBool);
        addNewItemInfoUserNameHeader.append(addNewItemInfoUserInput);
        addNewItemInfoUserName.append(addNewItemInfoUserNameHeader);
        addNewItemInfoList.append(addNewItemInfoUserName);

        var addNewPassword = this.generateContentSectionStandardDiv(); //Password
        var addNewPasswordHeader = this.generateContentSectionStandardHeader("Password");
        var addNewPasswordInput = this.generateContentSectionInputField(this.passwordInputId,'password',inputBool);
        addNewPasswordHeader.append(addNewPasswordInput);
        addNewPassword.append(addNewPasswordHeader);
        addNewPassword.append(this.generateContentSectionViewPassowrd(addNewPasswordHeader.find("input")));
        addNewItemInfoList.append(addNewPassword);

        //Password Generator Logic
        if (type===addNewItemHelper.edit || type===addNewItemHelper.new){
            var addNewPasswordGenerator = this.generatePasswordGenerator(addNewPasswordInput); //Password Generator
            addNewItemInfoList.append(addNewPasswordGenerator);
        }

        /*End of Info Field*/

        // var addNewItemCustomSection=$('<div></div');//Section Custom Field
        // addNewItemCustomSection.addClass('popup-list-section');
        // addNewItemCustomSection.append(this.generateContentSectionHeader("Custom Field"));
        /*End of Custoim Field */

        var addNewItemNoteSection=$('<div></div');//Section Note
        addNewItemNoteSection.addClass('popup-list-section');
        addNewItemNoteSection.append(this.generateContentSectionHeader("Note"));

        var addNewItemNoteList=$('<div></div>');
        addNewItemNoteList.css('border-top','2px solid lightgrey');
        // addNewItemNoteList.css('border-bottom','2px solid lightgrey');
        addNewItemNoteSection.append(addNewItemNoteList);

        var addNewItemNoteDiv = this.generateContentSectionStandardDiv();
        var addNewItemNoteHeader =this.generateContentSectionStandardHeader("Note Area");
        addNewItemNoteHeader.append(this.generateTextArea(this.noteInputId,inputBool));
        addNewItemNoteDiv.append(addNewItemNoteHeader);
        addNewItemNoteSection.append(addNewItemNoteDiv);

        /*End of Note Section */

        /*Delete Section*/
        //Wait first
        /*End of Delete Section */

        /*Start of Filling in form logic*/
        //Update New changes
        addNewItemInfoHeader.find('input').val(mainWindow.currentPageURL);
        addNewItemInfoNameHeader.find('input').val(mainWindow.currentPageTitle);
        addNewItemHelper.favicon = mainWindow.currentPageFavIconURL;

        addNewItemForm.append(addNewItemInfoSection);
        // addNewItemForm.append(addNewItemCustomSection);    
        addNewItemForm.append(addNewItemNoteSection);
        if (addNewItemDeleteSection)
            addNewItemForm.append(addNewItemDeleteSection);
        
        /*End of Auto filling in form logic */
        
        parent.append(addNewItemDiv); //Add generated tab to parent
    

            mainWindow.addNewItemWindow = addNewItemDiv; 
    
        setTimeout(function(){ //Move window to the top
                mainWindow.addNewItemWindow.css('top','0%');
        }, 100);
    },

    generateContentSectionHeader:function (messageString){ //Generate Top-most Section Header
        var returnResult = $('<div><b>'+ messageString +'</b></div>');
        returnResult.css('background-color','transparent');
        returnResult.css('color','#777777');
        returnResult.css('text-transform','uppercase');
        returnResult.css('font-size','13px');
        returnResult.css('padding','5px 10px');

        return returnResult;
    },

    generateContentSectionStandardDiv:function(){ //Genereate per row standard div
        var returnResult = $('<div></div>');
        returnResult.css('background-color','white');
        returnResult.css('padding','10px 10px');
        returnResult.hover(function(){
            returnResult.css('background-color',mainWindow.colorWhiteDarken);
        },
        function(){
            returnResult.css('background-color','white');
        });
        returnResult.click(function(){
            returnResult.find('.content-focus').focus();
        });
        
        returnResult.css('border-bottom','1px solid #E8E8E8');
        returnResult.css('display','flex');
        returnResult.css('align-items','center');
        returnResult.css('width','100%');

        return returnResult;
    },

    generateContentSectionStandardHeader:function(labelName){ //Standard per row header
        var returnResult = $('<div></div>');
        returnResult.css('width','100%');

        var label = $('<label>' + labelName + '</label>');
        label.css('color','#777777');
        // label.css('margin-bottom','5px');
        label.css('font-size','13px');
        label.css('display','block');
        label.css('text-overflow','nowrap');
        // label.css('white-space','nowrap');

        returnResult.append(label);
        return returnResult;
    },

    generateContentSectionSpecialHeader:function(headerName){
        var returnResult = $('<div></div>');
        returnResult.css('width','100%');

        var label = $('<label>'+headerName+'</label>');
        label.attr('readonly','readonly');
        label.addClass('popup-display-input-header');
        label.css('color','black');
        label.css('background-color','transparent');
        label.css('border','none');
        label.css('margin-bottom','0px');
        // label.css('margin-bottom','5px');
        label.css('font-size','13px');
        label.css('width','100%');
        label.css('display','block');
        label.css('text-overflow','ellipsis');
        // label.css('white-space','nowrap');

        returnResult.append(label);
        return returnResult;
    },

    generateContentSectionInputField:function(inputID,type,disabled){
        var returnResult = $('<input></input>');
        returnResult.attr('id',inputID);
        returnResult.attr('type',type);
        if (disabled){
            returnResult.attr('disabled','');
            // returnResult.css('white-space','nowrap');
        }
        returnResult.addClass('content-focus');
        returnResult.addClass('popup-input');
        returnResult.css('width','100%');
        returnResult.css('border','none');
        returnResult.css('background-color','transparent');

        return returnResult;
    },

    generateTextArea:function(inputID, disabled){
        var returnResult = $('<textarea></textarea>');
        returnResult.attr('id',inputID);
        returnResult.addClass('content-focus');
        returnResult.css('width','100%');
        returnResult.css('border','none');
        returnResult.css('background-color','transparent');

        if (disabled){
            returnResult.attr('disabled','true');
        }

        return returnResult;
    },

    generateContentSectionViewPassowrd(targetInputField){
        var returnResult = $('<span></span>');
        returnResult.addClass('fa');
        returnResult.addClass('fa-eye');

        returnResult.css('float','right');
        returnResult.css('font-size','18px');
        returnResult.css('cursor','pointer');

        returnResult.attr('title','Show Password');

        returnResult.click(function(){
            if (returnResult.hasClass('fa-eye')){
                returnResult.attr('title','Hide Password');
                targetInputField.attr('type','text');
                returnResult.addClass('fa-eye-slash');
                returnResult.removeClass('fa-eye');
            } 
            else{
                returnResult.attr('title','Show Password');
                targetInputField.attr('type','password');
                returnResult.removeClass('fa-eye-slash');
                returnResult.addClass('fa-eye');
            }
        });

        returnResult.hover(
            function(){
                returnResult.css('color',mainWindow.colorBlackWhiten);
            },
            function(){
                returnResult.css('color','black');
            }
        )

        return returnResult;
    },

    generatePasswordGenerator(inputField){
        var returnResult = $('<div></div>');
        returnResult.css('background-color','white');
        returnResult.css('padding','10px 10px');
        returnResult.css('border-bottom','1px solid rgb(232, 232, 232)');
        returnResult.css('cursor','pointer');        
        returnResult.hover(function(){
            returnResult.css('background-color',mainWindow.colorWhiteDarken);
        },
        function(){
            returnResult.css('background-color','white');
        });
        returnResult.click(function(){
            var body = $('body')

            PasswordGenerator.generatePasswordDiv(function(resultValue){
                inputField.val(resultValue);
            }, body, 1004);
        });

        var div = $('<div></div>');
        div.css('display','flex');
        div.css('align-items','center');

        var labelName = "Generate Passowrd";

        var label = $('<label>' + labelName + '</label>');
        label.css('color','#777777');
        label.css('font-size','13px');
        label.css('display','block');
        label.css('cursor','pointer');
        label.css('width','100%');

        var pointerIcon = $('<span></span>');
        pointerIcon.addClass('fa');
        pointerIcon.addClass('fa-caret-right');

        div.append(label);
        div.append(pointerIcon);
        returnResult.append(div);

        return returnResult;
    },

    
}
