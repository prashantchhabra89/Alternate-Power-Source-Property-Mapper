package populator;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.util.LinkedList;
import java.util.ListIterator;
import java.util.Scanner;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class WindJson {
	private static class WindObject {
		double lat;
		double lon;
		double ws30;

		public WindObject(double lat, double lon, double ws30) {
			this.lat = lat;
			this.lon = lon;
			this.ws30 = ws30;
		}
		
		public boolean equals(Object o) {
			if(!(o instanceof WindObject))
				return false;
			if(o == this)
				return true;
			if(this.lat != ((WindObject) o).getLat())
				return false;
			if(this.lon != ((WindObject) o).getLon())
				return false;
			if(this.ws30 != ((WindObject) o).getWs30())
				return false;
			return true;
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
		 * @return the ws30
		 */
		public double getWs30() {
			return ws30;
		}

		/**
		 * @param ws30 the ws30 to set
		 */
		public void setWs30(double ws30) {
			this.ws30 = ws30;
		}
		
	}
	
	public static void main(String[] args) {
		try {
			JSONArray[][] windFile = new JSONArray[630][5];
			LinkedList<WindObject> ll0 = new LinkedList<WindObject>();
			LinkedList<WindObject> ll1 = new LinkedList<WindObject>();
			LinkedList<WindObject> ll2 = new LinkedList<WindObject>();
			LinkedList<WindObject> ll3 = new LinkedList<WindObject>();
			LinkedList<WindObject> ll4 = new LinkedList<WindObject>();
			for(int i = 0; i < 630; i++) {
				for(int j = 0; j < 5; j++)
					windFile[i][j] = new JSONArray();
			}
			for(int f = 0; f < 7; f++) {
		    	//************************** 				CHANGE HERE
				InputStream input = null; 
				switch(f) {
				case 0: input =	new FileInputStream("D:/Doraemon/Documents/CSC/485B/Wind data/Vanc Wind/csv_headers_045_30.zip"); break;
				case 1: input =	new FileInputStream("D:/Doraemon/Documents/CSC/485B/Wind data/Vanc Wind/csv_headers_046_30.zip"); break;
				case 2: input =	new FileInputStream("D:/Doraemon/Documents/CSC/485B/Wind data/Vanc Wind/csv_headers_047_30.zip"); break;
				case 3: input =	new FileInputStream("D:/Doraemon/Documents/CSC/485B/Wind data/Vanc Wind/csv_headers_048_30.zip"); break;
				case 4: input =	new FileInputStream("D:/Doraemon/Documents/CSC/485B/Wind data/Vanc Wind/csv_headers_051_30.zip"); break;
				case 5: input =	new FileInputStream("D:/Doraemon/Documents/CSC/485B/Wind data/Vanc Wind/csv_headers_055_30.zip"); break;
				case 6: input =	new FileInputStream("D:/Doraemon/Documents/CSC/485B/Wind data/Vanc Wind/csv_headers_064_30.zip"); break;
				}
				System.out.println("File: " + f);
				ZipInputStream zip = new ZipInputStream(input);
				ZipEntry entry;

				int count = 0;
				int start = 1;
				while((entry = zip.getNextEntry()) != null) {
					count++;
					if(count < start)
						continue;
					int season = -1;
					
					//double toprightlat = 0.0, toprightlon = -180.0, btmleftlat = 90.0, btmleftlon = 0.0;
					@SuppressWarnings("resource")
					Scanner scanner = new Scanner(zip);
					String[] title = scanner.nextLine().split(",");
					int ws = 0, lat = 0, lon = 0;
					for(int i = 0; i < title.length; i++) {
						if(title[i].startsWith("\"EU_")) {
							ws = i;
						}
						else if(title[i].startsWith("\"LA_")) {
							lat = i;
						}
						else if(title[i].startsWith("\"LO_")) {
							lon = i;
						}
					}
	
					int rownum = 1;
					while (scanner.hasNextLine()) {
						rownum++;
						// Change here when crash
						if(rownum < 1) {
							scanner.nextLine();
							continue;
						}
						String[] result = scanner.nextLine().split(",");
						
						double ws30 = Double.parseDouble(result[ws]);
						if(ws30 < 0.0)
							continue;
						
						JSONObject windPoint = new JSONObject();
						
						double templat = Double.parseDouble(result[lat]);
						double templon = Double.parseDouble(result[lon])-360.0;
			
						/*if(templat > toprightlat) {
							toprightlat = templat;
						}
						if(templat < btmleftlat) {
							btmleftlat = templat;
						}
						if(templon > toprightlon) {
							toprightlon = templon;
						}
						if(templon < btmleftlon) {
							btmleftlon = templon;
						}*/
						
						LinkedList<WindObject> handle = null;
						
						switch(entry.getName()) {
						case "anu.csv": season = 0; handle = ll0; break;
						case "djf.csv": season = 1; handle = ll1; break;
						case "jja.csv": season = 2; handle = ll2; break;
						case "mam.csv": season = 3; handle = ll3; break;
						case "son.csv": season = 4; handle = ll4; break;
						}
						
						// Check for repetition
						WindObject obj = new WindObject(templat,templon,ws30);
						ListIterator<WindObject> it = handle.listIterator();
						boolean repeated = false;
						while(it.hasNext()) {
							WindObject temp = it.next();
							if(temp.equals(obj)){
								if(templat != temp.getLat() || templon != temp.getLon() || ws30 != temp.getWs30()) {
									System.out.println("Repeat: " + f + " " + season + " " + templat + " " + templon + " " + ws30);
									System.out.println("Repeated from: " + temp.getLat() + " " + temp.getLon() + " " + temp.getWs30());
								}
								repeated = true;
								break;
							}
						}
						if(repeated) {	
							continue;
						}
						else {
							handle.add(obj);
						}
	
						windPoint.put("lat",templat);
						windPoint.put("lon",templon);
						
						double ws5 = -1;
						double ws10 = -1;
						double ws15 = -1;
						double ws20 = -1;
						double ws25 = -1;
						double pre5 = -1;
						double pre10 = -1;
						double pre15 = -1;
						double pre20 = -1;
						double pre25 = -1;
						double pre30 = -1;
						if(ws30 >= 0.0) {
							ws5 = ws30*Math.pow(0.1666666667,0.14);
							ws10 = ws30*Math.pow(0.3333333333,0.14);
							ws15 = ws30*Math.pow(0.5,0.14);
							ws20 = ws30*Math.pow(0.6666666667,0.14);;
							ws25 = ws30*Math.pow(0.8333333333,0.14);;
							pre5 = 0.0005*1.24*Math.pow(ws5,3);
							pre10 = 0.0005*1.24*Math.pow(ws10,3);
							pre15 = 0.0005*1.24*Math.pow(ws15,3);
							pre20 = 0.0005*1.24*Math.pow(ws20,3);
							pre25 = 0.0005*1.24*Math.pow(ws25,3);
							pre30 = 0.0005*1.24*Math.pow(ws30,3);
						}
						
						windPoint.put("ws5",ws5);
						windPoint.put("ws10",ws10);
						windPoint.put("ws15",ws15);
						windPoint.put("ws20",ws20);
						windPoint.put("ws25",ws25);
						windPoint.put("ws30",ws30);
						windPoint.put("pre5",pre5);
						windPoint.put("pre10",pre10);
						windPoint.put("pre15",pre15);
						windPoint.put("pre20",pre20);
						windPoint.put("pre25",pre25);
						windPoint.put("pre30",pre30);
						
						System.out.println("File: " + f + " - " + entry.getName() + " Row: " + rownum);
						boolean forcebreak = false;
						for(int i = 0; i < 21; i++) {
							for(int j = 0; j < 30; j++) {
								if(templat >= (42.0 + i) && templat < (42.0 + i + 1.0)
										&& templon >= (-136.0 + j) && templon < (-136.0 + j + 1.0)) {
									windFile[i*30 + j][season].put(windPoint);
									forcebreak = true;
									break;
								}
							}
							if(forcebreak)
								break;
						}	
						//System.out.println("Done!");
					}
					
				}	
				zip.close();
			}
			
			String[] lat = new String[22];
			String[] lon = new String[31];
			String[] sea = {"anu.json","djf.json","jja.json","mam.json","son.json"};
			
			for(int i = 0; i < 22; i++) {
				lat[i] = String.valueOf((42+i));
			}
			for(int i = 0; i < 31; i++) {
				lon[i] = String.valueOf((-136+i));
			}
			
			
			String[][] filename = new String[630][5];
			for(int la = 0; la < lat.length-1; la++) {
				for(int lo = 0; lo < lon.length-1; lo++) {
					for(int s = 0; s < sea.length; s++) {
						filename[(la*(lon.length-1)+lo)][s] = "D:/Doraemon/Documents/CSC/485B/Wind data/Wind_JSON/"
								+ lat[la+1] + "_" + lon[lo+1] + "_" + lat[la] + "_" + lon[lo] + "_" + sea[s];
					}
				}
			}
			
			for(int i = 0; i < 630; i++) {
				for(int s = 0; s < 5; s++) {
					Writer w = new FileWriter(filename[i][s]);
					windFile[i][s].write(w);
					w.close();
				}
			}
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

}
