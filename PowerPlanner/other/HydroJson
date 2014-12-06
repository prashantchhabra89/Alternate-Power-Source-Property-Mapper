import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.util.Scanner;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class HydroJson {
	private static class Station {
		String name;
		double lat;
		double lon;
		Station(String name, double lat, double lon) {
			this.name = name;
			this.lat = lat;
			this.lon = lon;
		}
		/**
		 * @return the name
		 */
		public String getName() {
			return name;
		}
		/**
		 * @param name the name to set
		 */
		public void setName(String name) {
			this.name = name;
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
		
	}

	public static void main(String[] args) {
		try {
			// Reads in the station and their respective lat lon from the station list file
			Station[] stations = new Station[2409];
			FileReader file = new FileReader("D:/Doraemon/Documents/CSC/485B/Hydro Data/station list.csv");
			BufferedReader reader = new BufferedReader(file);
			reader.readLine();
			String line = "";
			int statnum = 0;
			while((line = reader.readLine()) != null) {
				String[] temp = line.split(",");
				stations[statnum] = new Station(temp[0],Double.parseDouble(temp[4]),Double.parseDouble(temp[5]));
				statnum++;
			}
			reader.close();
			
	    	//************************** 				CHANGE HERE
			InputStream input = new FileInputStream("D:/Doraemon/Documents/CSC/485B/Hydro Data/documents-export-2014-11-03.zip");
			ZipInputStream zip = new ZipInputStream(input);
			ZipEntry entry;
			
			// 5 different array, each for a different season
			JSONArray[] waterFile = new JSONArray[5];
			for(int i = 0; i < 5; i++){
				waterFile[i] = new JSONArray();
			}
			
			int count = 0;
			int start = 1;
			while((entry = zip.getNextEntry()) != null) {
				count++;
				if(count < start)
					continue;
				System.out.println(count);
				@SuppressWarnings("resource")
				Scanner scanner = new Scanner(zip);
				scanner.nextLine(); 
				scanner.nextLine();
				
				String statname = "";
				double[] sumMonths = new double[12];
				double[] numMonths = new double[12];
				for(int i = 0; i < 12; i++) {
					sumMonths[i] = 0.0;
					numMonths[i] = 0.0;
				}

				while (scanner.hasNextLine()) {
					String temp = scanner.nextLine() + "\n";
					String[] result = temp.split(",");
					if(result[0].equals("DISCLAIMER\n"))
						break;
					
					statname = result[0];
					
					// certain columns are left blank 
					// so need to track them to produce more accurate averaging
					for(int i = 0; i < 12; i++)
						if(!result[4+i*2].isEmpty()) {
							sumMonths[i] += Double.parseDouble(result[4+i*2]);
							numMonths[i]++;
						}
				}
				
				double sumAnnual = 0.0;
				double numAnnual = 0.0;
				for(int m = 0; m < 5; m++) {
					JSONObject waterPoint = new JSONObject();
					
					// grabs the respective lat lon
					for(int i = 0; i < stations.length; i++) {
						if(!stations[i].getName().equals(statname))
							continue;
						waterPoint.put("lat",stations[i].getLat());
						waterPoint.put("lon",stations[i].getLon());
						break;
					}
					
					if(m == 4) {
						// for annual
						if(numAnnual > 0) {
							double tempAvg = sumAnnual/numAnnual;
							double tempPre =  tempAvg*9.81;
							waterPoint.put("speed", tempAvg);
							waterPoint.put("precalc", tempPre);
						}
						else {
							waterPoint.put("speed", -1);
							waterPoint.put("precalc", -1);
							waterFile[m].put(waterPoint);
							break;
						}
					} else {
						// for seasonal
						int a = 0 , b = 0, c = 0;
						switch(m) {
						case 0: a = 11; b = 0; c = 1; break;
						case 1: a = 2; b = 3; c = 4; break;
						case 2: a = 5; b = 6; c = 7; break;
						case 3: a = 8; b = 9; c = 10; break;
						default: break;
						}
						if(numMonths[a] > 0 && numMonths[b] > 0 && numMonths[c] > 0) {
							double tempAvg1 = sumMonths[a]/numMonths[a];
							double tempAvg2 = sumMonths[b]/numMonths[b];
							double tempAvg3 = sumMonths[c]/numMonths[c];
							double tempAvg =  (tempAvg1 + tempAvg2 + tempAvg3)/3;
							double tempPre = tempAvg*9.81;
							waterPoint.put("speed", tempAvg);
							waterPoint.put("precalc", tempPre);
							
							sumAnnual = sumAnnual + tempAvg1 + tempAvg2 + tempAvg3;
							numAnnual = numAnnual + 3;
						} else if(numMonths[a] == 0 && numMonths[b] > 0 && numMonths[c] > 0) {
							double tempAvg1 = sumMonths[b]/numMonths[b];
							double tempAvg2 = sumMonths[c]/numMonths[c];
							double tempAvg =  (tempAvg1 + tempAvg2)/2;
							double tempPre = tempAvg*9.81;
							waterPoint.put("speed", tempAvg);
							waterPoint.put("precalc", tempPre);
							
							sumAnnual = sumAnnual + tempAvg1 + tempAvg2;
							numAnnual = numAnnual + 2;
						} else if(numMonths[a] > 0 && numMonths[b] == 0 && numMonths[c] > 0) {
							double tempAvg1 = sumMonths[a]/numMonths[a];
							double tempAvg2 = sumMonths[c]/numMonths[c];
							double tempAvg =  (tempAvg1 + tempAvg2)/2;
							double tempPre = tempAvg*9.81;
							waterPoint.put("speed", tempAvg);
							waterPoint.put("precalc", tempPre);
							
							sumAnnual = sumAnnual + tempAvg1 + tempAvg2;
							numAnnual = numAnnual + 2;
						} else if(numMonths[a] > 0 && numMonths[b] > 0 && numMonths[c] == 0) {
							double tempAvg1 = sumMonths[a]/numMonths[a];
							double tempAvg2 = sumMonths[b]/numMonths[b];
							double tempAvg =  (tempAvg1 + tempAvg2)/2;
							double tempPre = tempAvg*9.81;
							waterPoint.put("speed", tempAvg);
							waterPoint.put("precalc", tempPre);
							
							sumAnnual = sumAnnual + tempAvg1 + tempAvg2;
							numAnnual = numAnnual + 2;
						} else if(numMonths[a] == 0 && numMonths[b] == 0 && numMonths[c] > 0) {
							double tempAvg = sumMonths[c]/numMonths[c];
							double tempPre = tempAvg*9.81;
							waterPoint.put("speed", tempAvg);
							waterPoint.put("precalc", tempPre);
							
							sumAnnual = sumAnnual + tempAvg;
							numAnnual = numAnnual + 1;
						} else if(numMonths[a] == 0 && numMonths[b] > 0 && numMonths[c] == 0) {
							double tempAvg = sumMonths[b]/numMonths[b];
							double tempPre = tempAvg*9.81;
							waterPoint.put("speed", tempAvg);
							waterPoint.put("precalc", tempPre);
							
							sumAnnual = sumAnnual + tempAvg;
							numAnnual = numAnnual + 1;
						} else if(numMonths[a] > 0 && numMonths[b] == 0 && numMonths[c] == 0) {
							double tempAvg = sumMonths[a]/numMonths[a];
							double tempPre = tempAvg*9.81;
							waterPoint.put("speed", tempAvg);
							waterPoint.put("precalc", tempPre);
							
							sumAnnual = sumAnnual + tempAvg;
							numAnnual = numAnnual + 1;
						} else {
							waterPoint.put("speed", -1);
							waterPoint.put("precalc", -1);
							waterFile[m].put(waterPoint);
							continue;
						}
					}
					
					waterFile[m].put(waterPoint);
				}
				
			}	
			for(int i = 0; i < 5; i++) {
				String filename = "";
				switch(i) {
				case 0: filename = "D:/Doraemon/Documents/CSC/485B/Hydro Data/Hydro JSON/Hydro_djf.json"; break;
				case 1: filename = "D:/Doraemon/Documents/CSC/485B/Hydro Data/Hydro JSON/Hydro_mam.json"; break;
				case 2: filename = "D:/Doraemon/Documents/CSC/485B/Hydro Data/Hydro JSON/Hydro_jja.json"; break;
				case 3: filename = "D:/Doraemon/Documents/CSC/485B/Hydro Data/Hydro JSON/Hydro_son.json"; break;
				case 4: filename = "D:/Doraemon/Documents/CSC/485B/Hydro Data/Hydro JSON/Hydro_anu.json"; break;
				}
				Writer w = new FileWriter(filename);
				waterFile[i].write(w);
				w.close();
			}
			zip.close();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}

	}

}
