/**
 * These functions calculate one single point only.
 */
function windPow(precalc,eff,area) {
	return precalc*eff*area;
}

function solarPow(raw,eff,area,loss) {
	return raw*eff*area*loss;
}

function hydroPow(precalc,eff,heightdiff) {
	return precalc*eff*heightdiff;
}