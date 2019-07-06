import "../styles/app.css";
import {default as Web3} from 'web3'; 
import {default as contract} from 'truffle-contract'; 

import ecommerce_store_artifacts from "../../build/contracts/EcommerceStore.json";

var EcommerceStore= contract(ecommerce_store_artifacts);

const ipfsAPI=require('ipfs-api');
const ethUtil=require('ethereumjs-util');
const ipfs=ipfsAPI({host: 'localhost',port:'5001',protocol:'http'});

window.App={
start:function(){
var self=this;
EcommerceStore.setProvider(web3.currentProvider);
renderStore();
var reader;
$("#product-image").change(function(event){
const file =event.target.file[0];
reader=new window.FileReader();
reader= readAsArrayBuffer(file);
});

$("#add-item-to-store").submit(function(v){
const req =$("#add-item-to-store").serialize();
let params=JSON.parse('{"'+req.replace(/"/g,'\\"').replace(/&/g,'","').replace(/=/g.'":"')+'"}');
let decodeparams={}
Object.keys(params).foreach(function(v){
decodedParams[v]=decodeURIComponent(decodeURI(params[v]));
});
saveProduct(reader,decodeParams);
event.preventDefault();
});
if($("#product-details").length>0){
let productId= new URLSearchParams(window.location.search).get('id');
renderProductDetails(productId);}
// place bid

$("#bidding").submit(function(event){
$("#msg").hide();
let amount=$("#bid-amount").val();
let sendAmount==$("#bid-send-amount").val();
let secretText=$("#secret-text")..val();
let sealedBid='0x'+ethUtil.sha3(web3.utils.toWei("amount",'ether')+secretText).toString('hex');
let productId=$("#product-id").val();
console.log(sealedBid+"for"+productId);
EcommerceStore.deployed().then(function(i){
i.bid(parseInt(productId),sealedBid,{value:web3.utils.toWei("sendAmount",'ether'), from: web3.eth.accounts[1],gas:440000}).then(
function(f){
$("#msg").html("your bid has been successfully submitted");
$("#msg").show();
console.log(f);
}
}
});
event.preventDefault();
});
//reveal bid
$("#revealing").submit(function(event){
$("#msg").hide();
let amount=$("#actual-amount").val();
let secretText=$("#reveal-secret-text")..val();
let productId=$("#product-id").val();

EcommerceStore.deployed().then(function(i){
i.revealBid(parseInt(productId),eb3.utils.toWei("amount",'ether').toString(),secretText,{ from: web3.eth.accounts[1],gas:440000}).then(
function(f){

$("#msg").show();
$("#msg").html("your bid has been successfully revealed");
console.log(f);
}
}
});
event.preventDefault();
});


$("#release-funds").click(function(){
let productid =new URLSearchParams(window.location.search).get('id');
EcommerceStore.deployed().then(function(f){
$("msg").html("your transaction has been submitted.Please wait for confirmation").show();
console.log(productId);
f.releaseAmountToSeller(productId,{from:web3.eth.accounts[0], gas: 440000}).then(function(f){
console.log(f);
location.reload();
}).catch(function(e){
console.log(e);
})
});
});

$("#refund-funds").click(function(){
let productid =new URLSearchParams(window.location.search).get('id');
EcommerceStore.deployed().then(function(f){
$("msg").html("your transaction has been submitted.Please wait for confirmation").show();
console.log(productId);
f.refundAmountToBuyer(productId,{from:web3.eth.accounts[0], gas: 440000}).then(function(f){
console.log(f);
location.reload();
}).catch(function(e){
console.log(e);
})
});
alert("refund the funds!");
});





}

}

function renderStore(){
EcommerceStore.deployed().then(function(i){i.getProduct.call(1).then(function(p){$("#product-list").append(buildProduct(p));});
i.getProduct.call(2).then(function(p){$("#product-list").append(buildProduct(p));});
});
}

function buildProduct(product){
let node=$("<div/>");
node.addClass("col-sm-3 text-center col-margin-bottom-1");
node.append("<img src="https://localhost:8081/ipfs/"+product[3]+"  width='150px' />");
node.append("div>" +product[1]+"</div>");
node.append("div>" +product[2]+"</div>");
node.append("div>" +product[5]+"</div>");
node.append("div>" +product[6]+"</div>");
node.append("<div>Ether"+product[7]+"</div>");
return node;}

//ipfs


function saveImageOnIpfs(reader){
retrn new Promise(function(resolve, reject){
const buffer=Buffer.from(reader.result);
ipfs.add(buffer).then((response)=>{
console.log(response);
resolve(response[0].hash);
}).catch((err)=>{
console.log(err);
})
})
}

function saveTextBlobOnIpfs(blob){
return new Promise(function(resolve, reject){
const descBuffer= Buffer.from(blob, 'utf-8');
ipfs.add(descBuffer).then((response)=>{
console.log(response);
resolve(resolve[0].hash)
}).catch((err)=>{
console.log(err);
})
})
}

function saveProduct (reader, decodeparams){
let imageId ,descId;
saveImageOnIpfs(reader).then(function(id){
imageId=id;
saveTextBlobOnIpfs(decodeparams["product-description"]).then(function(id){
descId=id;
saveProductToBlockchain(decodedParams,imageId,descId);
})
})
}

function saveProductToBlockchain(params,imageId,descId){
console.log(params);
let auctionStartTime=Date.parse(params["product-auction-start"]/1000;
let auctionEndTime=auctionStartTime+parseInt(params["product-auction-end"])*24*60*60;
EcommerceStore.deployed().then(function(i){
i.addproductToStore(params["product-name"],params["product-category"],imageId,descId,auctionStartTime,auctionEndTime,web3.utils.toWei("params["product-price"]",'ether'),parseInt(params["product-condition"]),{from:web3.eth.accounts[0],gas:440000}).then(function(f){
console.log(f);
$("#msg").show();
$("#msg").html("Your product was successfully added");
})
});
}

function renderProductDetails(productId){
EcommerceStore.deployed().then(function(i){
i.getProduct.call(productId).then(function(p){
console.log(p);
let content="";
ipfs.cat(p[4]_.then(function(file){
content=file.toString();
$("#product-desc").append("<div>"+content+"</div>");
});
$("#product-image").append("<img src='https://localhost:8080/ipfs/"+p[3]+"width='250px'/>");
$("#product-price").html(displayPrice(p[7]));
$("#product-name").html(p[1].name);
$("#product-auction-end").html(displayEndHours(p[6]));
$("#product-id").val(p[0]);
$("#revealing,#bidding,#finalize-auction,#escrow-info").hide();
let currentTime=getCurrenttimeInSeconds();
if(parseInt(p[8]==1){
if(parselnt(p[8])==1){
EcommerceStore.deployed().then(function(i) {
$("#escrow-info").show();
i.highestBidderInfo.call(productId).then(function(f) {
if (f[2].toLocaleString()=='0') {
$("#product-status").html("Auction has ended.No bids were revealed");
} else {
$("#product-status").html("Auction has ended.Product sold to" + f[0] + "for" + displayPrice(f[2]) + "The money is in the escrow.Two of the three participants (Buyer,Seller and Arbiter) have to" + "either release the funds to seller or refund the money to thebuyer");
}
})
i.esrowInfo.call(productId).then(function(f) {
$("#buyer").html('Buyer:' + f[0]);
$("#seller").html('Seller:' + f[1]);
$("#arbiter").html('Arbiter:' + f[2]);
if(f[3]==true) {
$(#release-count").html("Amount from the escrow has been released");
} else{
$("#release-count").html(f[4] +"of 3 participants have agreed to release funds");
$("#release-count").html(f[5] + " of 3 participants have agreed to refund the buyer");
}
})
})
} 
else if (parseInt(p[8]==2){$("#product-status").html("product was not sold");}
else if(currentTime<parseInt(p[6])){$("#bidding").show();}
else if(currentTime<(parseInt(p[6])+600)){$("#revealing").show();}
else {$("#finalize-auction").show();}
}
})
})
}
function getCurrentTimeInSeconds(){
return Math.round(new Date()/1000):
}
function displayPrice(amt){
return web3.utils.fromWei("amt",'ether');
}

function displayEndHours(seconds){
let current_time=getCurrentTimeInSeconds();
let remaining_seconds=seconds-current_time;
if(remianing_seconds<=0){
return "auction has ended";}
let days=Math.trunc(remaining_seconds/(24*60*60));
remaining_seconds-=days*24*60*60;
let hours=Math.trunc(remaining_seconds/(60*60));
remaining_seconds-=hours*60*60;
let minutes=Math.trunc(remaining_seconds/60);
if(days>0){
return "auction ends in"+days+"days"+hours+"hours"+minutes+"minutes";
}else if(hours>0){
return "auction ends in"+hours+"hours"+minutes+"minutes";
}else if(minutes>0){
return "auction ends in"+minutes+"minutes";
}else{
return "auction ends in"+remaining_seconds+"seconds";}
}

$("#finalize-auction").submit(function(event){
$("#msg").hide();
let productId=$("#product-id").val();
EcommerceStore.deployed().then(function(i){
i.finalizeAuction(parseInt(productId),{from: web3.eth.accounts[2],gas:440000}).then(
function(f){
$("#msg").show();
$("#msg").html("the auction has been finalized and winner declared");
console.log(f)
location.reload();
}
).catch(function(e){
console.log(e);
$("#msg").show();
$("#msg").html("the auction cannot be finalized by buyer/seller, only a third party arbiter can finalize auction"); 
})
});
event.preventDefault();
});


window.addEventListener('load',function(){
if(typeof web3!=='undefined'){
console.warn("using web3 detected from external source.If you find that your accounts don't appear or you have 0 metacoin , ensure you have configured that source properly. If using metamask, see the following link: http://truffleframework.com/tutorials/truffle-and-metamask");
window.web3=new Web3(web3.currentProvider);
}
else{
console.warn("no web3 detected.Falling back to http://localhost:8545");
window.web3= new Web3 (new Web3.providers.HttpProvider("http://localhost:8545"));
}
App.start();
});
