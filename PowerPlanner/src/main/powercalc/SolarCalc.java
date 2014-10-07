package main.powercalc;

public class SolarCalc {
	private DataTuple[] potential;
	private int tilt;
	
	public SolarCalc() {
		this.potential = null;
		this.tilt = 0;
	}

	/**
	 * Calculates power for Solar.
	 * 
	 * @param topleftlat latitude value for top left corner of map
	 * @param topleftlon longitude value for top left corner of map
	 * @param btmrightlat latitude value for bottom right corner of map
	 * @param btmrightlon longitude value for bottom right corner of map
	 * @param efficiency efficiency of the solar panels
	 * @param area total area of the solar panels
	 * @param losses coefficient for losses; for default value put 0.75
	 * @param tilt angle of solar panels' tilt with respect to latitude
	 * @return array of DataTuple where the data is the calculated power
	 */
	public DataTuple[] powerCalc(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon, double efficiency, double area, double losses, int tilt) {
		if(tilt == -1) {
			potential = forTesting(topleftlat,topleftlon,btmrightlat,btmrightlon);
		}
		else if(potential == null || this.tilt != tilt) {
			this.tilt = tilt;
			potential = fromDatabase(topleftlat,topleftlon,btmrightlat,btmrightlon,tilt);
		}
		
		DataTuple[] temp = new DataTuple[potential.length];
		
		for(int i = 0; i < potential.length; i++) {
			temp[i] = new DataTuple(potential[i].getLat(),potential[i].getLon(),(potential[i].getData()*efficiency*area*losses));
		}
		
		return temp;
	}
	
	// TODO
	private DataTuple[] fromDatabase(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon, int tilt) {
		return null;
	}

	private  DataTuple[] forTesting(double topleftlat, double topleftlon, double btmrightlat, double btmrightlon) {
		DataTuple[] temp = new DataTuple[4];
		temp[0] = new DataTuple(topleftlat,topleftlon,1.0);
		temp[1] = new DataTuple(topleftlat,btmrightlon,1.0);
		temp[2] = new DataTuple(btmrightlat,topleftlon,1.0);
		temp[3] = new DataTuple(btmrightlat,btmrightlon,1.0);
		return temp;
	}
}
