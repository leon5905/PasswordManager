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
    download:function (filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
    },

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

    getTabsInfo: function(callback){
        var getting = browser.windows.getCurrent({populate: true});
        getting.then(callback, null);
    },

    extractRootDomain:function(url) {
        var domain = mainWindow.extractHostname(url),
            splitArr = domain.split('.'),
            arrLen = splitArr.length;
    
        //extracting the root domain here
        //if there is a subdomain 
        if (arrLen > 2) {
            domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
            //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
            if (splitArr[arrLen - 1].length == 2 && splitArr[arrLen - 1].length == 2) {
                //this is using a ccTLD
                domain = splitArr[arrLen - 3] + '.' + domain;
            }
        }
        return domain;
    },

    extractHostname:function(url) {
        var hostname;
        //find & remove protocol (http, ftp, etc.) and get hostname
    
        if (url.indexOf("://") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }
    
        //find & remove port number
        hostname = hostname.split(':')[0];
        //find & remove "?"
        hostname = hostname.split('?')[0];
    
        return hostname;
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

    preintialize:function(){ //Load before dom is ready
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


        //Load URL, Title and Favicon
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
};

//Initialize mainWindow
mainWindow.preintialize();
// data=[];
// console.log(data);
// console.log('Testing');
// // Encrypt
// var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'secret key 123');
// // Decrypt
// var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123');
// var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// console.log(decryptedData);

//Main Page Section
var mainPageHelper = {
    contentHead: null,
    mainPageContent:null,

    loadMainPage:function(recordList){ //Load the main page by ini / reinitialize the main page content
        mainPageHelper.contentHead = $('#popup-home-content'); //Load the reference
        if (!( typeof mainPageContent === "undefined") && mainPageContent!=null) {
            mainPageContent.remove(); //Remove previous content
        }

        //Seperate List
        currentListIndex = [];
        otherListIndex = [];
        for (var i=0;i<recordList.length;i++){
            //Comparing current url and stored url...
            var storedURL = recordList[i].url;
            storedURL = mainWindow.extractRootDomain(storedURL);
            // var storedURLRegExp = new RegExp(storedURL,'i');

            var currentURL = mainWindow.currentPageURL;
            currentURL = mainWindow.extractRootDomain(currentURL);
            var currentURLRegExp = new RegExp(currentURL,'i');

            // var bool1 = currentURLRegExp.test(storedURL);
            var bool2 = currentURLRegExp.test(storedURL);

            if (bool2){ //If true
                
                currentListIndex[currentListIndex.length] = i;
            }
            else{
                otherListIndex[otherListIndex.length] = i;
            }
        }

        //Printing Result for validation
        // console.log("Printing Current List");
        // for (var i=0;i<currentListIndex.length;i++){
        //     console.log(mainWindow.recordList[currentListIndex[i]]);
        // }
        // console.log("Printing Other List");
        // for (var i=0;i<otherListIndex.length;i++){
        //     console.log(mainWindow.recordList[otherListIndex[i]]);
        // }

        var mainDiv = $('<div></div>');
        mainPageContent = mainDiv;

        //Current Tab Section
        var currentTabSection=$('<div></div');
        currentTabSection.addClass('popup-list-section');
        currentTabSection.append(addNewItemHelper.generateContentSectionHeader("Suggested Login"));
        var currentTabList=$('<div></div>');
        currentTabList.css('border-top','2px solid lightgrey');
        currentTabList.css('border-bottom','2px solid lightgrey');

        if (currentListIndex.length==0){ //Append No record
            //TODO
            currentTabList.append(mainPageHelper.generateMainPageViewNoItem());
        }
        else{
            for (var i=0;i<currentListIndex.length;i++){ //Append correponsding item
                var currentItem = (mainWindow.recordList[currentListIndex[i]]);
                currentTabList.append(mainPageHelper.generateMainPageView(currentItem,currentListIndex[i]));
            }
        }

        currentTabSection.append(currentTabList);
        //End of Currentab Section

        //Current Tab Section
        var otherTabSection=$('<div></div');
        otherTabSection.addClass('popup-list-section');
        otherTabSection.append(addNewItemHelper.generateContentSectionHeader("Others"));
        var otherTabList=$('<div></div>');
        otherTabList.css('border-top','2px solid lightgrey');
        otherTabList.css('border-bottom','2px solid lightgrey');
        otherTabSection.append(otherTabList);//End of Currentab Section

        if (otherListIndex.length==0){ //Append no record
            //TODO
            otherTabList.append(mainPageHelper.generateMainPageViewNoItem());
        }
        else{
            for (var i=0;i<otherListIndex.length;i++){ //Append correponsding item
                var currentItem = (mainWindow.recordList[otherListIndex[i]]);
                otherTabList.append(mainPageHelper.generateMainPageView(currentItem,otherListIndex[i]));

            }
        }
        //End of other tab section

        mainDiv.append(currentTabSection);
        mainDiv.append(otherTabSection);

        mainPageHelper.contentHead.append(mainDiv); //Append the final form to the main view

        //Synchonise and reset most stuff
        mainWindow.searchEmptyDiv.css('display','none'); //Hide no search result
        mainPageHelper.searchFunction(mainWindow.searchInput.val());
    },

    searchFunction: function(parameter){ // Will search for match in Name
        //Go through list, disable and enable visibility
        var searchDiv = $('body').children('.popup-div').find('.popup-list-section');
        var allNoResult = true;
        searchDiv.each(function(){
            var allRecordDiv = $(this).find('.popup-record-div');
            var noResult = true;
            
            var paraReg =  new RegExp(parameter,'i');
            allRecordDiv.each(function(){
                var instance = $(this);
                if (instance.attr('id')<0){
                    if (parameter==='' || !parameter){
                        instance.css('display','block');
                        noResult=false;
                        allNoResult=false;
                    }
                    else{
                        instance.css('display','none');
                    }

                    return;
                }
        
                if (paraReg.test(mainWindow.recordList[instance.attr('id')].username) || paraReg.test(mainWindow.recordList[instance.attr('id')].name)){
                    instance.css('display','flex');
                    // console.log(paraReg.test(mainWindow.recordList[instance.attr('id')].name));
                    noResult=false;
                    allNoResult=false;
                }
                else{
                    // instance.css('visibility','hidden');
                    instance.css('display','none');
                }
            });

            if (noResult){
                var thisDiv =  $(this);
                thisDiv.css('display','none');
            }
            else{
                var thisDiv =  $(this);
                thisDiv.css('display','block');
            }
        });

        if (allNoResult){
            //Display Special Div ?? - remind no result by searching
            mainWindow.searchEmptyDiv.css('display','flex');
        }else{
            //Hide Special Div
            mainWindow.searchEmptyDiv.css('display','none');
        }

        // if (!parameter || !parameter.trim() || this.length === 0){} //Search bar is empty - Restore relevant div visibility
    },

    generateMainPageView: function(currentItem,index){
        var div = addNewItemHelper.generateContentSectionStandardDiv();//Div
        div.attr('id',index);
        div.addClass('popup-record-div');

        var header = addNewItemHelper.generateContentSectionSpecialHeader(currentItem.name);
        header.find('label').css('color','black');
        header.css('cursor','pointer');
        header.attr('title','Auto-fill');
        header.click(function(){
            var executableCode = 
            `
            var inputList = document.getElementsByTagName("input");
            var regExpEmail = new RegExp('email', "i");
            var regExpUsername = new RegExp('username', "i");
            // var regExpEmail = /email/;
            for (var i=0; i<inputList.length; i++){
                var inputField = inputList[i];
                var inputFieldName = inputField.name.toLowerCase();
                if (inputField.type === 'password' ||  inputField.type === 'Password' || inputField.type === 'PASSWORD'){
                    inputField.value = '`+currentItem.password+`'
                }
                else if (inputFieldName === 'username' || inputFieldName === 'loginname'|| inputFieldName=== 'login' || inputFieldName === 'email' || inputFieldName === 'user' || inputFieldName === 'identifier' || regExpEmail.test(inputFieldName) || regExpUsername.test(inputFieldName)){
                        inputField.value = '`+currentItem.username+`';
                }
            }
            `

            mainWindow.pushNotification('Auto-filled');

            var executing = browser.tabs.executeScript({
                code: executableCode
            });
            executing.then(function(){
            }, 
            function(error){
                // alert('Execute Script on Active Tab fail with : ' + error);
            });
        });

        var labelUserName = addNewItemHelper.generateContentSectionSpecialHeader(currentItem.username);
        header.append(labelUserName);
        header.find('label').each(function () {
            $(this).css('cursor','pointer');
            $(this).click(function(e){
               
            });
        });

        div.append(header);

        //Logo Section
        var logoDiv = $('<div></div>');
        logoDiv.css('cursor','pointer');
        logoDiv.attr('title','Launch Website');
        logoDiv.click(function(){ //Open Website
            var win = window.open(currentItem.url, '_blank');
            win.focus();
        });
        logoDiv.css('padding','0px 10px 0px 0px');
        var img = $('<img></img>');
        img.attr('src',currentItem.favicon);
        img.attr('width','24');
        img.attr('height','24');
        // img.css('border-radius','50%');
        logoDiv.append(img);
        div.prepend(logoDiv);

        //Action Section
        div.append(addNewItemHelper.generateContentSectionCopyContent(currentItem.username,'fa-user','Copy Username'));
        div.append(addNewItemHelper.generateContentSectionCopyContent(currentItem.password,'fa-key','Copy Password'));
        div.append(addNewItemHelper.generateContentSectionEditContent(currentItem,index));

        return div;
    },

    generateMainPageViewNoItem: function(){
        var div = addNewItemHelper.generateContentSectionStandardDiv();//Div
        div.attr('id','-1');
        div.addClass('popup-record-div');

        var noitemLabel = $('<label>There is no item on the list.</label>');
        div.append(noitemLabel);


        return div;
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
};

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

                mainWindow.saveData(targetDiv.find('#'+addNewItemHelper.urlInputId).val(),targetDiv.find('#'+addNewItemHelper.nameInputId).val(),targetDiv.find('#'+addNewItemHelper.usernameInputId).val(),
                    targetDiv.find('#'+addNewItemHelper.passwordInputId).val(), targetDiv.find('#'+addNewItemHelper.noteInputId).val(), faviconSource);

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

            //Fav Icon
            var favIconDiv = this.generateContentSectionStandardDiv();
            var favIconHeader = this.generateContentSectionStandardHeader("Display Icon URL");

            var favIconDiv2 = $('<div></div>');
            favIconDiv2.css("display","flex");
            var favIconDisplay =  $('<img></img>');
            favIconDisplay.css("width","24px");
            favIconDisplay.css("height","24px");

            var favIconURLInput = this.generateContentSectionInputField(addNewItemHelper.favIconId,'text',inputBool);
            favIconURLInput.on('input',function(){
                var url = $(this).val();
                favIconDisplay.attr('src',url);

                if (url=== ''){
                    favIconDisplay.attr('src',"/icons/favicon-32x32.png");
                }
            });

            if (type===addNewItemHelper.edit){
                var item = mainWindow.recordList[index];

                favIconURLInput.val(item.favicon);
            }
            else{
                favIconURLInput.val(mainWindow.currentPageFavIconURL);
            }

            favIconDisplay.attr('src',favIconURLInput.val());
            if (favIconURLInput.val()=== ''){
                favIconDisplay.attr('src',"/icons/favicon-32x32.png");
            }

            favIconDiv2.append(favIconDisplay);
            favIconDiv2.append(favIconURLInput);
            favIconHeader.append(favIconDiv2);
            favIconDiv.append(favIconHeader);
            addNewItemInfoList.append(favIconDiv);
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
        var addNewItemDeleteSection;
        if (type===addNewItemHelper.edit){
            //Delete Functionality
            addNewItemDeleteSection=$('<div></div');//Section Note
            addNewItemDeleteSection.addClass('popup-list-section');
            addNewItemDeleteSection.append(this.generateContentSectionHeader("Delete"));

            var addNewItemDeleteList=$('<div></div>');
            addNewItemDeleteList.css('border-top','2px solid lightgrey');

            var addNewDeleteFunction = this.generateDeleteSection(index); //Delete 
            addNewItemDeleteList.append(addNewDeleteFunction);

            addNewItemDeleteSection.append(addNewItemDeleteList);
    
        }
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
        if (index>=0){ //Punch in all the correct value according to index
            var item = mainWindow.recordList[index];

            addNewItemDiv.find('#'+addNewItemHelper.urlInputId).val(item.url);
            addNewItemDiv.find('#'+addNewItemHelper.nameInputId).val(item.name);
            addNewItemDiv.find('#'+addNewItemHelper.usernameInputId).val(item.username);
            addNewItemDiv.find('#'+addNewItemHelper.passwordInputId).val(item.password);
            addNewItemDiv.find('#'+addNewItemHelper.noteInputId).val(item.note);
            addNewItemDiv.find('#'+addNewItemHelper.favIconId).val(item.favicon);
        }
    
        //Cache the created window
        if (type === addNewItemHelper.view)
            mainWindow.addNewItemView = addNewItemDiv;
        else if (type === addNewItemHelper.edit)
            mainWindow.addNewItemEdit = addNewItemDiv;
        else
            mainWindow.addNewItemWindow = addNewItemDiv; 
    
        setTimeout(function(){ //Move window to the top
            if (type === addNewItemHelper.view)
                mainWindow.addNewItemView.css('top','0%');
            else if (type === addNewItemHelper.edit)
                mainWindow.addNewItemEdit.css('top','0%');
            else
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

    generateContentSectionCopyContent(targetValue, fontAwesomeIconClass, titleToolhint){
        var returnResult = $('<span></span>');
        returnResult.addClass('fa');
        returnResult.addClass(fontAwesomeIconClass);

        returnResult.css('float','right');
        returnResult.css('font-size','18px');
        returnResult.css('cursor','pointer');
        returnResult.css('margin-left','5px');

        returnResult.attr('title',titleToolhint);

        returnResult.click(function(){
            mainWindow.hiddenInputField = $(document.body).find('#hiddenInput');
            var targetInput = mainWindow.hiddenInputField;

            targetInput.val(targetValue);

            targetInput.select();
            document.execCommand("copy");
            targetInput.val();
            mainWindow.pushNotification('Copied to Clipboard');
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

    generateContentSectionEditContent(currentItem, index){
        var returnResult = $('<span></span>');

        returnResult.addClass('fa');
        returnResult.addClass('fa-edit');

        returnResult.css('float','right');
        returnResult.css('font-size','18px');
        returnResult.css('cursor','pointer');
        returnResult.css('margin-left','5px');

        returnResult.attr('title','View Content');

        returnResult.click(function(){
            addNewItemHelper.addNewItem($(".popup-body"), addNewItemHelper.view, index);
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

    //Specific Implementation
    generateDeleteSection(index){
        var returnResult = $('<div></div>');
        returnResult.css('background-color','white');
        returnResult.css('padding','10px 10px');
        returnResult.css('cursor','pointer');
        returnResult.hover(function(){
            returnResult.css('background-color',mainWindow.colorWhiteDarken);
        },
        function(){
            returnResult.css('background-color','white');
        });
        returnResult.click(function(){
            mainWindow.deleteDataByIndex(index);

            mainWindow.addNewItemEdit.css('top','100%');
            mainWindow.addNewItemView.css('top','100%');

            mainWindow.pushNotification('Reocrd Deleted');

            setTimeout(function(){
                    mainWindow.addNewItemView.remove();
                    mainWindow.addNewItemView = null;

                    mainWindow.addNewItemEdit.remove();
                    mainWindow.addNewItemEdit = null;
            }, 500);
            
        });

        var div = $("<div></div>");


        var labelName = "Delete Item";
        var label = $('<label>' + labelName + '</label>');
        label.css('color','red');
        label.css('cursor','pointer');
        label.css('font-size','13px');
        label.css('display','inline');
        label.css('margin-left','5px');

        var deleteIcon = $('<i></i>');
        deleteIcon.addClass('fa');
        deleteIcon.addClass('fa-trash');
        deleteIcon.css('color','red');

        div.append(deleteIcon);
        div.append(label);
        returnResult.append(div);
        return returnResult;
    }

    
}
