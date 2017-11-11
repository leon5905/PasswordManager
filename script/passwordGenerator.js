var PasswordGenerator= {
    lengthField:null,
    lowerCaseField:null,
    upperCaseField:null,
    specialCharField:null,
    numericField:null,

    passwordDisplayField:null,

    //Standard Generate password function
    generatePassword:function(length,lowerCaseChar,upperCaseChar,specialChar,numeric){
        var length = length,
        charset = "abcdefghijklmnopqrstuvwxyz"
        upperCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        numericSet = "0123456789"
        specialCharSet = "!@#$%^&*"
        retVal = "";

        //Decide set index
        setIndex = [];
        numberOfSet =0;

        if (lowerCaseChar==1) {
            setIndex[setIndex.length] = charset;
            numberOfSet++;
        }
        if (upperCaseChar==1){
            setIndex[setIndex.length] = upperCharset;
            numberOfSet++;
        }
        if (specialChar==1){
            setIndex[setIndex.length] = specialCharSet;
            numberOfSet++;
        }
        if (numeric==1){
            setIndex[setIndex.length] = numericSet;
            numberOfSet++;
        }

        for (var i = 0, n = numberOfSet; i < length; ++i) {
            //Roll which set first
            targetSetString = setIndex[(Math.floor(Math.random() * n))];

            //Roll to see which element
            retVal += targetSetString.charAt(Math.floor(Math.random() * targetSetString.length));
        }

        return retVal;
    },

    generatePasswordDiv:function(callback,targetBody, zindex){
        var defaultPassword = this.generatePassword(12,true,true,true,true);

        var div =  $('<div id="passwordGenerator"></div>'); //Main Window

        div.css('width','100%');
        div.css('height','100%');
        div.css('z-index',zindex);
        div.css('top','100%');
        div.css('position','absolute');
        div.css('background',mainWindow.colorPrimary2);
        div.css('transition','all 0.4s ease-out 0s');

        if (callback){
            div.append(mainPageHelper.generateMainPageHeader('Password Generator',function(){
                //Left Hand Function
                div.css('top','100%');

                setTimeout(function() {
                    div.remove();
                }, 400);
            },
            function(){
                //Right Hand Function
                callback(passwordDisplayLabel.text());

                div.css('top','100%');

                setTimeout(function() {
                    div.remove();
                }, 400); 
            },
            "fa-close","fa-check"));
        }
        else{
            div.append(mainPageHelper.generateMainPageHeader('Password Generator',function(){
                //Left Hand Function
                div.css('top','100%');

                setTimeout(function() {
                    div.remove();
                }, 400);
            },
            null,
            "fa-close",''));
        }

        var passwordDisplayLabel = $('<div>'+ defaultPassword +'</div>'); //Top Generated Password 
        passwordDisplayLabel.css('width','100%');
        passwordDisplayLabel.css('overflow','ellipses');
        passwordDisplayLabel.css('text-align','center');
        passwordDisplayLabel.css('font-size','20px');
        passwordDisplayLabel.css('margin-top','5px');
        passwordDisplayLabel.css('margin-bottom','10px');

        var copyPasswordDiv = this.generateRowDiv();
        copyPasswordDiv.css('cursor','pointer');
        var copyPasswordLabel = this.generateRowLabel('Copy Password');
        copyPasswordLabel.css('cursor','pointer');
        copyPasswordDiv.click(function(){
            var tempInput = document.createElement("input");
            tempInput.style = "position: absolute; left: -1000px; top: -1000px";
            tempInput.value = passwordDisplayLabel.text();
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);

            if (mainWindow){
                mainWindow.pushNotification('Copied to Clipboard');
            }
        });
        copyPasswordDiv.append(copyPasswordLabel);

        var regenerateDiv = this.generateRowDiv(); //Regenereta Password
        regenerateDiv.css('cursor','pointer');
        regenerateDiv.click(function(){
           PasswordGenerator.refreshPasswordGenerator();
        });
        var regenerateLabel = this.generateRowLabel('Regenerate Password');
        regenerateLabel.css('cursor','pointer'); 
        regenerateDiv.append(regenerateLabel);

        var charLengthDiv = this.generateRowDiv(); //Character Length 
        charLengthDiv.css('display','flex');
        charLengthDiv.css('width','100%');
        var charLengthEmptyDiv = $("<div></div>");
        charLengthEmptyDiv.css('width','100%');
        var charLengthLabel = this.generateRowLabel('Password Length');
        var charLengthSlider = $('<input type="range" min="1" max="32" value="12" class="slider" id="slider"></input>');
        charLengthSlider.css("margin-left",'5px');
        charLengthSlider.css("margin-right",'5px');
        charLengthSlider.css("float",'right');
        charLengthSlider.on('input',function(){
            charLengthDisplay.text(charLengthSlider.val());
            PasswordGenerator.refreshPasswordGenerator();
        });

        var charLengthDisplay = $('<span></span>');
        charLengthDisplay.text(charLengthSlider.val());
        charLengthDisplay.css('float','right');
        charLengthDisplay.css('min-width','24px');

        charLengthEmptyDiv.append(charLengthLabel);
        charLengthEmptyDiv.append(charLengthDisplay);
        charLengthEmptyDiv.append(charLengthSlider);
        charLengthDiv.append(charLengthEmptyDiv);

        //Lower Case
        var lowerCaseDiv = this.generateRowDiv(); 
        lowerCaseDiv.css('display','flex');
        lowerCaseDiv.css('width','100%');
        var lowerCaseEmptyDiv = $("<div></div>");
        lowerCaseEmptyDiv.css('width','100%');
        //- abcdefghijklmnopqrstvwxyz
        var lowerCaseLabel = this.generateRowLabel('Lower Case Character');
        var lowerCaseCheckBox = $('<input type="range" min="0" max="1" value="1" class="slider" id="slider"></input>');
        lowerCaseCheckBox.css("margin-left",'5px');
        lowerCaseCheckBox.css("margin-right",'5px');
        lowerCaseCheckBox.css("float",'right');
        lowerCaseCheckBox.on('input',function(){
            var text = 'OFF';
            if (lowerCaseCheckBox.val()==1) text='ON';
            lowerCaseDisplayRight.text(text);

            PasswordGenerator.refreshPasswordGenerator();
        });

        var lowerCaseDisplayRight = $('<span>ON</span>');
        lowerCaseDisplayRight.css('float','right');
        lowerCaseDisplayRight.css('min-width','24px');

        lowerCaseEmptyDiv.append(lowerCaseLabel);
        lowerCaseEmptyDiv.append(lowerCaseDisplayRight);
        lowerCaseEmptyDiv.append(lowerCaseCheckBox);
        lowerCaseDiv.append(lowerCaseEmptyDiv);

        //Upper Case
        var upperCaseDiv = this.generateRowDiv(); 
        upperCaseDiv.css('display','flex');
        upperCaseDiv.css('width','100%');
        var upperCaseEmptyDiv = $("<div></div>");
        upperCaseEmptyDiv.css('width','100%');
        // - ABCDEFGHIJKLMNOPQRSTVWXYZ
        var upperCaseLabel = this.generateRowLabel('Upper Case Character');
        var upperCaseCheckBox = $('<input type="range" min="0" max="1" value="1" class="slider" id="slider"></input>');
        upperCaseCheckBox.css("margin-left",'5px');
        upperCaseCheckBox.css("margin-right",'5px');
        upperCaseCheckBox.css("float",'right');
        upperCaseCheckBox.on('input',function(){
            var text = 'OFF';
            if (upperCaseCheckBox.val()==1) text='ON';
            upperCaseDisplayRight.text(text);

            PasswordGenerator.refreshPasswordGenerator();
        });

        var upperCaseDisplayRight = $('<span>ON</span>');
        upperCaseDisplayRight.css('float','right');
        upperCaseDisplayRight.css('min-width','24px');

        upperCaseEmptyDiv.append(upperCaseLabel);
        upperCaseEmptyDiv.append(upperCaseDisplayRight);
        upperCaseEmptyDiv.append(upperCaseCheckBox);
        upperCaseDiv.append(upperCaseEmptyDiv);

        //Special Case
        var specialCharDiv = this.generateRowDiv(); 
        specialCharDiv.css('display','flex');
        specialCharDiv.css('width','100%');
        var specialCharEmptyDiv = $("<div></div>");
        specialCharEmptyDiv.css('width','100%');
        // - !@#$%^&*
        var specialCharLabel = this.generateRowLabel('Special Character');
        var specialCharCheckBox = $('<input type="range" min="0" max="1" value="1" class="slider" id="slider"></input>');
        specialCharCheckBox.css("margin-left",'5px');
        specialCharCheckBox.css("margin-right",'5px');
        specialCharCheckBox.css("float",'right');
        specialCharCheckBox.on('input',function(){
            var text = 'OFF';
            if (specialCharCheckBox.val()==1) text='ON';
            specialCharDisplayRight.text(text);

            PasswordGenerator.refreshPasswordGenerator();
        });

        var specialCharDisplayRight = $('<span>ON</span>');
        specialCharDisplayRight.css('float','right');
        specialCharDisplayRight.css('min-width','24px');

        specialCharEmptyDiv.append(specialCharLabel);
        specialCharEmptyDiv.append(specialCharDisplayRight);
        specialCharEmptyDiv.append(specialCharCheckBox);
        specialCharDiv.append(specialCharEmptyDiv);

         //Special Case
         var numericDiv = this.generateRowDiv(); 
         numericDiv.css('display','flex');
         numericDiv.css('width','100%');
         var numericEmptyDiv = $("<div></div>");
         numericEmptyDiv.css('width','100%');
         //- 0123456789
         var numericLabel = this.generateRowLabel('Numeric Character');
         var numericCheckBox = $('<input type="range" min="0" max="1" value="1" class="slider" id="slider"></input>');
         numericCheckBox.css("margin-left",'5px');
         numericCheckBox.css("margin-right",'5px');
         numericCheckBox.css("float",'right');
         numericCheckBox.on('input',function(){
            var text = 'OFF';
            if (numericCheckBox.val()==1) text='ON';
            numericDisplayRight.text(text);

             PasswordGenerator.refreshPasswordGenerator();
         });
 
         var numericDisplayRight = $('<span>ON</span>');
         numericDisplayRight.css('float','right');
         numericDisplayRight.css('min-width','24px');
 
         numericEmptyDiv.append(numericLabel);
         numericEmptyDiv.append(numericDisplayRight);
         numericEmptyDiv.append(numericCheckBox);
         numericDiv.append(numericEmptyDiv);

        div.append(passwordDisplayLabel);
        div.append(copyPasswordDiv);
        div.append(regenerateDiv);
        div.append(charLengthDiv);
        div.append(lowerCaseDiv);
        div.append(upperCaseDiv);
        div.append(specialCharDiv);
        div.append(numericDiv);

        targetBody.append(div);

        setTimeout(function(){
            div.css('top','0%');
        },100);

        //Storing all reference 
        this.passwordDisplayField = passwordDisplayLabel;
        this.lengthField = charLengthSlider;
        this.lowerCaseField = lowerCaseCheckBox;
        this.upperCaseField = upperCaseCheckBox;
        this.specialCharField = specialCharCheckBox;
        this.numericField = numericCheckBox;

        return;
    },

    refreshPasswordGenerator(){
        this.passwordDisplayField.text(this.generatePassword(this.lengthField.val(),this.lowerCaseField.val(),this.upperCaseField.val(),this.specialCharField.val(),this.numericField.val()));
    },

    generateRowDiv:function(){ //Genereate per row standard div
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

    generateRowLabel:function(str){
        var rowLabel = $('<label>'+ str +'</label>');
        rowLabel.css('margin-bottom','0px');
        
        return rowLabel;
    }
}