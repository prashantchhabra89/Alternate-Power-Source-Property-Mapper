package main.powercalc;

public class HydroCalc {
	private DataTuple[] waterflow;
	
	public HydroCalc() {
		this.waterflow = null;
	}
	
	/**
	 * Calculates power for Hydro.
	 * 
	 * @param topleftlat latitude value for top left corner of map
	 * @param topleftlon longitude value for top left corner of map
	 * @param btmrightlat latitude value for bottom right corner of map
	 * @param btmrightlon longitude value for bottom right corner of map
	 * @param efficiency hydraulic efficiency of the water turbines
	 * @param heightdiff height difference between inlet and outlet
	 * @return array of DataTuple where the data is the calculated power
	 */
	public DataTuple[] powerCalc(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon, double efficiency, double heightdiff) {
		if(heightdiff == -1) {
			heightdiff = 1;
			waterflow = forTesting(topleftlat,topleftlon,btmrightlat,btmrightlon);
		}
		else if(waterflow == null)
			waterflow = fromDatabase(topleftlat,topleftlon,btmrightlat,btmrightlon);
		
		DataTuple[] temp = new DataTuple[waterflow.length];
		
		for(int i = 0; i < waterflow.length; i++) {
			temp[i] = new DataTuple(waterflow[i].getLat(),waterflow[i].getLon(),(waterflow[i].getData()*efficiency*heightdiff));
		}
		
		return temp;
	}
	
	// TODO
	private DataTuple[] fromDatabase(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon) {
		return null;
	}

	private  DataTuple[] forTesting(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon) {
		DataTuple[] temp = new DataTuple[4];
		temp[0] = new DataTuple(topleftlat,topleftlon,1.0*1000.0*9.81);
		temp[1] = new DataTuple(topleftlat,btmrightlon,1.0*1000.0*9.81);
		temp[2] = new DataTuple(btmrightlat,topleftlon,1.0*1000.0*9.81);
		temp[3] = new DataTuple(btmrightlat,btmrightlon,1.0*1000.0*9.81);
		return temp;
	}
}
