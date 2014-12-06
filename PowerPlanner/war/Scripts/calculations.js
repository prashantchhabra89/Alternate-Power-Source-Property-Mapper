/*
 * Calculates the wind power for a single point.
 * 
 * 	precalc: the partial power calculation
 * 	eff: the efficiency of the turbine
 * 	area: the area covered by the rotor blades
 * 
 *  returns: the instantaneous power potential of the point
 */
function windPow(precalc,eff,area) {
	return precalc*eff*area;
}

/*
 * Calculates the solar power for a single point.
 * 
 * raw: the partial power calculation
 * eff: the efficiency of the solar panel
 * area: the area covered by the panel
 * loss: the loss factor of the solar panel
 * 
 *  returns: the instantaneous power potential of the point
 */
function solarPow(raw,eff,area,loss) {
	return raw*eff*area*loss;
}

/*
 * Calculates the hydro power for a single point.
 * 
 * 	precalc: the partial power calculation
 * 	eff: the efficiency of the micro-hydro generatory
 * 	heightdiff: the drop of the river from inlet to outlet
 * 
 *  returns: the instantaneous power potential of the point
 */
function hydroPow(precalc,eff,heightdiff) {
	return precalc*eff*heightdiff;
}