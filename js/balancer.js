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

function BlanceResult(averageCost, transfers) {
	this.averageCost = averageCost;
	this.transfers = transfers;
}

function balance(participants) {
	var averageCost = calculatetAverageCost(participants);
	
	var surpluses = [];
	var deficits = [];
	var transfers = [];
	
	return new BalanceResult([], averageCost
}

function calculatetAverageCost(participants) {
	var totalCount = 0;
	var totalCost = 0;
	
	for (var participant in participants) {
		totalCount += participant.count;
		totalCost += participant.cost;
	}
	
	return totalCost/totalCount;
}

export { Participant, balance };