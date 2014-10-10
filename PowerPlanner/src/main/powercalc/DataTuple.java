package main.powercalc;

public class DataTuple {
	private double lat;
	private double lon;
	private double data;
	
	
	DataTuple() {
		this.lat = 0.0;
		this.lon = 0.0;
		this.data = 0.0;
	}
	
	DataTuple(double lat, double lon, double data) {
		this.lat = lat;
		this.lon = lon;
		this.data = data;
	}
	
	DataTuple(DataTuple dt) {
		this.lat = dt.getLat();
		this.lon = dt.getLon();
		this.data = dt.getData();
	}

	/**
	 * @return the lat
	 */
	public double getLat() {
		return lat;
	}

	/**
	 * @param lat the lat to set
	 */
	public void setLat(double lat) {
		this.lat = lat;
	}

	/**
	 * @return the lon
	 */
	public double getLon() {
		return lon;
	}

	/**
	 * @param lon the lon to set
	 */
	public void setLon(double lon) {
		this.lon = lon;
	}

	/**
	 * @return the data
	 */
	public double getData() {
		return data;
	}

	/**
	 * @param data the data to set
	 */
	public void setData(double data) {
		this.data = data;
	}
}
