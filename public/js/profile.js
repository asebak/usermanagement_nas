var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();
var dappAddress = 'n1wkefRnGXPJHU9RCiHTMDct6Uo51DuQjVo';
function getProfile(addressId){
    var to = dappAddress
    var value = "0";
    var callFunction = "get";
    var callArgs = "[\"" + addressId + "\"]";
    nebPay.simulateCall(to, value, callFunction, callArgs, {    
        listener: cbSearch     
    });
}

function updateProfile(){
    var name = $("#profileInfo :input[name='name']").val(); 
    var location = $("#profileInfo :input[name='location']").val(); 
    var website = $("#profileInfo :input[name='website']").val(); 
    var avatar = "";
    var to = dappAddress;
    var value = "0";
    var callFunction = "save"
    var callArgs = "[\"" + name + "\", \"" + location + "\", \"" + website + "\", \"" + avatar + "\"]";

    nebPay.call(to, value, callFunction, callArgs, {  
        listener: function(response){
            debugger;
            console.log(response);
        }
    });
}

function cbSearch(resp) {
    var result = resp.result
    console.log("return of rpc call: " + JSON.stringify(result))

    if (result === 'null'){
        console.log('empty profile');
    } else{
        //if result is not null, then it should be "return value" or "error message"
        try{
            result = JSON.parse(result)

            var name = $("#profileInfo :input[name='name']").val(result.name); 
            var location = $("#profileInfo :input[name='location']").val(result.location); 
            var website = $("#profileInfo :input[name='website']").val(result.website); 
            var avatar = result.avatar;
        }catch (err){
            //result is the error message
        }

    }

}

  