var MasterKeySetup = {
    masterKey: '1',

    setup: function (callback, isFirstTime, currentMasterkey) {
        var thisDiv = $("#popup-master-key-div");
        thisDiv.css('opacity', 1);
        thisDiv.css('z-index', 2000);

        var cancelBtn = $('#popup-master-cancel-btn');
        var confirmBtn = $('#popup-master-key-btn');
        confirmBtn.unbind('click');
        var currentRow = $('#popup-master-key-current-row');
        var newMasterKeyRow = $('#popup-master-key-new-row');
        var confirmNewMasterKeyRow = $('#popup-master-key-confirm-row');
        var warningText = $('#popup-master-key-warning');

        cancelBtn.click(function () {
            MasterKeySetup.hideDiv();
        });

        if (isFirstTime) {
            currentRow.hide();
            cancelBtn.hide();

            confirmBtn.click(function () {
                var isConfirmed = false;
                var newPassword = newMasterKeyRow.find('input').val();
                var confirmNewPassword = confirmNewMasterKeyRow.find('input').val();

                if (newPassword == confirmNewPassword && newPassword !=''){ //Check new password and confirm password
                    isConfirmed = true;
                }

                if (isConfirmed) {
                    //Restore state
                    warningText.css('display','none');
                    currentRow.find('input').val('');
                    currentRow.find('input').removeClass('wrong');
                    newMasterKeyRow.find('input').val('');
                    newMasterKeyRow.find('input').removeClass('wrong');
                    confirmNewMasterKeyRow.find('input').val('');
                    confirmNewMasterKeyRow.find('input').removeClass('wrong');

                    MasterKeySetup.hideDiv();

                    //Ready to complete
                    callback(newPassword);
                }
                else{
                    //Give feedback
                    warningText.css('display','block');
                    
                    //Reset text
                    currentRow.find('input').val('');
                    currentRow.find('input').addClass('wrong');
                    newMasterKeyRow.find('input').val('');
                    newMasterKeyRow.find('input').addClass('wrong');
                    confirmNewMasterKeyRow.find('input').val('');
                    confirmNewMasterKeyRow.find('input').addClass('wrong');
                }
            });
        }
        else {
            currentRow.show();
            cancelBtn.show();

            confirmBtn.click(function () {
                var isConfirmed = false;
                var isNewCorrect =false;
                var newPassword = newMasterKeyRow.find('input').val();
                var confirmNewPassword = confirmNewMasterKeyRow.find('input').val();
                var currentPassword = currentRow.find('input').val();

                if (newPassword == confirmNewPassword && newPassword !=''){ //Check new password and confirm password
                    isConfirmed = true;
                }

                if (currentPassword == currentMasterkey){
                    isNewCorrect = true;
                }

                if (isConfirmed && isNewCorrect) {
                    //Restore state
                    warningText.css('display','none');
                    currentRow.find('input').val('');
                    currentRow.find('input').removeClass('wrong');
                    newMasterKeyRow.find('input').val('');
                    newMasterKeyRow.find('input').removeClass('wrong');
                    confirmNewMasterKeyRow.find('input').val('');
                    confirmNewMasterKeyRow.find('input').removeClass('wrong');

                    MasterKeySetup.hideDiv();

                    //Ready to complete
                    console.log('calling back')
                    callback(newPassword);
                }
                else{
                    console.log('wrongt');
                    //Give feedback
                    warningText.css('display','block');
                    
                    //Reset text
                    currentRow.find('input').val('');
                    currentRow.find('input').addClass('wrong');
                    newMasterKeyRow.find('input').val('');
                    newMasterKeyRow.find('input').addClass('wrong');
                    confirmNewMasterKeyRow.find('input').val('');
                    confirmNewMasterKeyRow.find('input').addClass('wrong');
                }
            });

        }
    },

    hideDiv: function () {
        var thisDiv = $("#popup-master-key-div");

        thisDiv.css('opacity', 0);

        setTimeout(function () {
            thisDiv.css('z-index', -1000);
        }, 410);
    }
}
