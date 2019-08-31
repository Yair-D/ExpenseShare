const ils_entity = "&#8362;";

var lastParticipantIndex;
var participantsDiv;
var resultsDiv;

function getParticipantDivId(index) {
	return "participant_" + index;
}

function getParticipantNameId(index) {
	return "name_" + index;
}

function getParticipantNameWarningId(index) {
	return "name_" + index + "_warn";
}

function getParticipantCostId(index) {
	return "cost_" + index;
}

function getParticipantCostWarningId(index) {
	return "cost_" + index + "_warn";
}


function getParticipantCountId(index) {
	return "count_" + index;
}

function addParticipant() {
	var newIndex = lastParticipantIndex++;
	
	"<div class=\"participant\" id=\"" + getParticipantDivId(newIndex) + "\">"
	var newParticipantDiv = document.createElement("div");
	newParticipantDiv.id = getParticipantDivId(newIndex);
	newParticipantDiv.className = "participant rounded-box";
	newParticipantDiv.innerHTML = 
		 "<image class=\"delete-participant clickable\" src=\"img/x.svg\" onClick=\"deleteParticipant(" + newIndex + ")\" /><br/>"
			+ "<label class=\"font-small\">שם</label>"
			+ "<input"
				+ " type=\"text\""
				+ " id=\"" + getParticipantNameId(newIndex) + "\""
				+ " maxlength=\"12\""
				+ " onfocusout=\"validateInput(" + getParticipantNameId(newIndex) + "," + getParticipantNameWarningId(newIndex) + ", false)\""
				+ " placeholder=\"הכנס שם...\">"
			+" </input>"
			+ "<div id=\"" + getParticipantNameWarningId(newIndex) + "\" class=\"warning font-small\">"
				+ "<image src=\"img/warning.svg\" class=\"warning-image\" />"
				+ "יש להכניס שם"
			+ "</div>"
			+ "<div class=\"input\">"
				+ "<label class=\"font-small\">מס' אנשים</label>"
				+ "<select class=\"clickable font-medium\" id=\"" + getParticipantCountId(newIndex) +"\">"
					+ "<option class=\"font-medium\" value=\"1\">1</option>"
					+ "<option value=\"2\">2</option>"
					+ "<option value=\"3\">3</option>"
					+ "<option value=\"4\">4</option>"
					+ "<option value=\"5\">5</option>"
				+ "</select>"
			+ "</div>"
			+ "<div class=\"input right-col\">"
				+ "<label class=\"font-small\">הוצאה</label>"
				+ "<input"
					+ " type=\"number\""
					+ " id=\"" + getParticipantCostId(newIndex) + "\""
					+ " onfocusout=\"validateInput(" + getParticipantCostId(newIndex) + "," + getParticipantCostWarningId(newIndex) + ", true)\""
					+ " placeholder=\"0\">"
				+ "</input>"
				+ "<div id=\"" + getParticipantCostWarningId(newIndex) + "\" class=\"warning font-small\">"
					+ "<image src=\"img/warning.svg\" class=\"warning-image\" />"
					+ "יש להכניס סכום תקין"
				+ "</div>"
			+ "</div>";
	
	participantsDiv.appendChild(newParticipantDiv);
	document.getElementById(getParticipantNameId(newIndex)).focus;
}

function validateInput(input, warningElement, shouldBeNumber) {
	var cleanValue = input.value.trim();
	if (shouldBeNumber) {
		var numberValue = Number.parseFloat(cleanValue);
		cleanValue = Number.isNaN(numberValue) ? "" : Math.max(Math.min(Math.round(numberValue), 9999), 0);		
	}
	
	input.value = cleanValue;
	
	if (cleanValue !== "") {
		input.class = "";
		warningElement.style.display = "none";
		
		return true;
	}
	
	input.class = "warning";
	warningElement.style.display = "block";
	input.focus();
	return false;
}

function Participant(id, count, cost) {
	this.id = id;
	this.count = count;
	this.cost = cost;
}

function Transfer(fromId, toId, amount) {
	this.fromId = fromId;
	this.toId = toId;
	this.amount = amount;
}

function balance(participants, averageCost) {
	var surpluses = [];
	var deficits = [];
	var transfers = [];
	
	for (var i = 0; i < participants.length; i++) {
		var participantDeficit = participants[i].cost - averageCost*participants[i].count;
	
		if (participantDeficit > 0) {
			deficits.push(new Participant(participants[i].id, -1, participantDeficit));
		}
		else if (participantDeficit < 0) {
			surpluses.push(new Participant(participants[i].id, -1, -participantDeficit));
		}
	}
	
	// sort surpluses and deficits from high to low in money
	surpluses.sort(function (a, b) { a.cost - b.cost }).reverse();
	deficits.sort(function (a, b) { a.cost - b.cost }).reverse();
	
	var i = j = 0;
	while (i < surpluses.length && j < deficits.length) {
		var roundedSurplus = Math.round(surpluses[i].cost)
		var roundedDeficit = Math.round(deficits[j].cost)
		
		if (roundedSurplus == roundedDeficit) {
			transfers.push(new Transfer(surpluses[i].id, deficits[j].id, roundedSurplus));
			surpluses[i].cost = 0;
			deficits[j].cost = 0;
			i++;
			j++;
		}
		else if (roundedSurplus > roundedDeficit) {
			transfers.push(new Transfer(surpluses[i].id, deficits[j].id, roundedDeficit));
			surpluses[i].cost -= roundedDeficit;
			deficits[j].cost = 0;
			j++;
		}
		else if (roundedSurplus < roundedDeficit) {
			transfers.push(new Transfer(surpluses[i].id, deficits[j].id, roundedSurplus));
			surpluses[i].cost = 0;
			deficits[j].cost -= roundedSurplus;
			i++;
		}
	}
	
	return transfers;
}

function calculatetAverageCost(participants) {
	var totalCount = 0;
	var totalCost = 0;
	
	for (var i = 0; i < participants.length; i++) {
		totalCount += participants[i].count;
		totalCost += participants[i].cost;
	}
	
	return totalCost/totalCount;
}

function collectData() {
	var participants = [];
	
	var firstInvalidInputIndex = -1;
	
	for (var i = 0; i < participantsDiv.children.length; i++) {
		var index = participantsDiv.children[i].id.split("_")[1];
		
		// fields validation:
		var isNameValid = 
			validateInput(
				document.getElementById(getParticipantNameId(index)),
				document.getElementById(getParticipantNameWarningId(index)),
				false);
				
		var isCostValid = 
			validateInput(
				document.getElementById(getParticipantCostId(index)),
				document.getElementById(getParticipantCostWarningId(index)),
				true);		
		
		if ((!isNameValid || !isCostValid) && firstInvalidInputIndex < 0) {
			firstInvalidInputIndex = i;
		}
		
		var count = parseInt(document.getElementById(getParticipantCountId(index)).value);
		var cost = parseInt(document.getElementById(getParticipantCostId(index)).value);
		
		participants.push(new Participant(index, count, cost));
	}

	if (firstInvalidInputIndex >= 0)
	{
		participantsDiv.children[firstInvalidInputIndex].scrollIntoView();
		return null;
	}
	
	return participants;
}

function renderParticipantResults(participantData, transfers) {
	var participantName = document.getElementById(getParticipantNameId(participantData.id)).value;
	var incomingTransfers = transfers.filter(transfer => transfer.toId == participantData.id).sort(function (a, b) { a.fromId - b.fromId }).reverse();
	var outgoingTransfers = transfers.filter(transfer => transfer.fromId == participantData.id).sort(function (a, b) { a.toId - b.toId }).reverse();
	
	// should not happen!
	if (incomingTransfers.length > 0 && outgoingTransfers.length > 0) {
		alert("Error in the algorithm!");
		return "";
	}
	
	var participantClass = outgoingTransfers.length > 0 ? "giver" : "receiver";
	var spentVerb = participantData.count > 1 ? "הוציאו" : "הוציא/ה";
	var getVerb = participantData.count > 1 ? "מקבלים" : "מקבל/ת";
	var giveVerb = participantData.count > 1 ? "מחזירים" : "מחזיר/ה";
	var participantSpending = parseInt(document.getElementById(getParticipantCostId(participantData.id)).value);
	var participantSum = participantSpending;
	
	var participantHtml =
		"<div class=\"participant-transfer\">"
			+ "<div class=\"participant-transfer-title font-large\">"
				+ "<div class=\"transfer-right-col " + participantClass + " \">" + participantName + "</div>"
				+ "<div class=\"transfer-left-col\">"
					+ "<image src=\"img/" + (participantClass == "receiver" ? "take" : "give") + ".svg\" class=\"tranfser-image\" />"
				+ "</div>"
			+ "</div>"
			+ "<div class=\"transfer-right-col font-medium " + participantClass + "\">" + spentVerb + "</div>"
			+ "<div class=\"transfer-left-col font-medium " + participantClass + "\">" + "&#8362;" +  participantSpending + "</div>";

	for (var i = 0; i < incomingTransfers.length; i++) {
		var otherParticipantName = document.getElementById(getParticipantNameId(incomingTransfers[i].fromId)).value;
		
		participantHtml +=
			"<div class=\"transfer-right-col font-medium " + participantClass + " transfer-large\">" + getVerb + " מ" + otherParticipantName + ":</div>"
			+ "<div class=\"transfer-left-col font-medium " + participantClass + " transfer-large\">&#8362;" + incomingTransfers[i].amount + "</div>";
			
		participantSum -= incomingTransfers[i].amount;
	}
	
	for (var i = 0; i < outgoingTransfers.length; i++) {
		var otherParticipantName = document.getElementById(getParticipantNameId(outgoingTransfers[i].toId)).value;
		
		participantHtml +=
			"<div class=\"transfer-right-col font-medium " + participantClass + " transfer-large\">" + giveVerb + " ל" + otherParticipantName + ":</div>"
			+ "<div class=\"transfer-left-col font-medium " + participantClass + " transfer-large\">&#8362;" + outgoingTransfers[i].amount + "</div>";
			
		participantSum += outgoingTransfers[i].amount;
	}
	
	participantHtml +=
		"<hr />"
		+ "<div class=\"transfer-right-col font-medium " + participantClass + "\">סה\"כ (" + participantData.count + " אנשים)</div>"
		+ "<div class=\"transfer-left-col font-medium " + participantClass + "\">&#8362;" + participantSum + "</div>";
	
	return participantHtml + "</div>";
}

function calculate() {
	var participantsData = collectData();
	
	if (participantsData == null) {
		return;
	}
	
	var average = calculatetAverageCost(participantsData);
	var transfers = balance(participantsData, average);
		
	document.getElementById("average_cost_value").innerHTML = ils_entity + Math.round(average*100)/100;
	var transfersHtml = "";
	
	for (var i = 0; i < participantsData.length; i++) {
		transfersHtml += renderParticipantResults(participantsData[i], transfers);
	}
	
	document.getElementById("participants_transfers").innerHTML = transfersHtml;
	
	resultsDiv.style.display = "block";	
	resultsDiv.scrollIntoView(); 
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

function deleteParticipant(i) {
	document.getElementById(getParticipantDivId(i)).remove();
}

function clearAll() {
	document.getElementById("participants").innerHTML = "";	
	resultsDiv.style.display = "none";
	init();	
	document.getElementById("top").scrollIntoView(); 
}

function init() {
	lastParticipantIndex = 0;
	participantsDiv = document.getElementById("participants");
	resultsDiv = document.getElementById("results");
	
	for (var i = 0; i < 2; i++) {
		addParticipant();
	}
}

if (window.addEventListener) {
	window.addEventListener('load', init);
} else {
	window.attachEvent('onload', init);
}