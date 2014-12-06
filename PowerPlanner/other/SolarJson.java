package populator;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.util.Arrays;
import java.util.Scanner;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class SolarJson {

	public static void main(String[] args) {
		try {
	    	//************************** 				CHANGE HERE
			InputStream input = new FileInputStream("dat/SolarData.zip");
			ZipInputStream zip = new ZipInputStream(input);
			ZipEntry entry;
			
			// 5 different array, each for a different season
			JSONArray[] sunFile = new JSONArray[5];
			for(int i = 0; i < 5; i++){
				sunFile[i] = new JSONArray();
			}
			

			int count = 0;
			int start = 1;
			while((entry = zip.getNextEntry()) != null) {
				count++;
				if(count < start)
					continue;
				//if(!entry.getName().equals("anu.csv")) 
					//continue;
				
				@SuppressWarnings("resource")
				Scanner scanner = new Scanner(zip);
				scanner.nextLine();

				double[] anu = new double[6]; Arrays.fill(anu, 0.0);
				double[] win = new double[6]; Arrays.fill(win, 0.0);
				double[] spr = new double[6]; Arrays.fill(spr, 0.0);
				double[] sum = new double[6]; Arrays.fill(sum, 0.0);
				double[] fal = new double[6]; Arrays.fill(fal, 0.0);
				double templat = 0.0;
				double templon = 0.0;
				int rownum = 1;
				while (scanner.hasNextLine()) {
					rownum++;
					// Change here when crash
					if(rownum < 1) {
						scanner.nextLine();
						continue;
					}
					String[] result = scanner.nextLine().split(",");
		
					templat = Double.parseDouble(result[2]);
					templon = Double.parseDouble(result[1]);

					double[] handle = null;
					switch(result[3]) {
					case "December": handle = win; break;
					case "January": handle = win; break;
					case "February": handle = win; break;
					case "March": handle = spr; break;
					case "April": handle = spr; break;
					case "May": handle = spr; break;
					case "June": handle = sum; break;
					case "July": handle = sum; break;
					case "August": handle = sum; break;
					case "September": handle = fal; break;
					case "October": handle = fal; break;
					case "November": handle = fal; break;	
					default: handle = anu; break;
					}
					handle[0] = handle[0] + Double.parseDouble(result[9].replaceAll("\"", ""));
					handle[1] = handle[1] + Double.parseDouble(result[7].replaceAll("\"", ""));
					handle[2] = handle[2] + Double.parseDouble(result[5].replaceAll("\"", ""));
					handle[3] = handle[3] + Double.parseDouble(result[6].replaceAll("\"", ""));
					handle[4] = handle[4] + Double.parseDouble(result[4].replaceAll("\"", ""));
					handle[5] = handle[5] + Double.parseDouble(result[8].replaceAll("\"", ""));
				}
				for ( int i = 0; i < 6; i++) {
					win[i] = win[i]/3.0;
					spr[i] = spr[i]/3.0;
					sum[i] = sum[i]/3.0;
					fal[i] = fal[i]/3.0;
				}
				// brute force!!!
				JSONObject sunPoint_anu = new JSONObject();
				JSONObject sunPoint_win = new JSONObject();
				JSONObject sunPoint_spr = new JSONObject();
				JSONObject sunPoint_sum = new JSONObject();
				JSONObject sunPoint_fal = new JSONObject();
				
				sunPoint_anu.put("lat",templat);
				sunPoint_anu.put("lon",templon);
				sunPoint_win.put("lat",templat);
				sunPoint_win.put("lon",templon);
				sunPoint_spr.put("lat",templat);
				sunPoint_spr.put("lon",templon);
				sunPoint_sum.put("lat",templat);
				sunPoint_sum.put("lon",templon);
				sunPoint_fal.put("lat",templat);
				sunPoint_fal.put("lon",templon);
				
				sunPoint_anu.put("deg0", anu[0]);
				sunPoint_anu.put("deg30", anu[1]);
				sunPoint_anu.put("deg45", anu[2]);
				sunPoint_anu.put("deg60", anu[3]);
				sunPoint_anu.put("deg90", anu[4]);
				sunPoint_anu.put("deg360", anu[5]);
				sunPoint_win.put("deg0", win[0]);
				sunPoint_win.put("deg30", win[1]);
				sunPoint_win.put("deg45", win[2]);
				sunPoint_win.put("deg60", win[3]);
				sunPoint_win.put("deg90", win[4]);
				sunPoint_win.put("deg360", win[5]);
				sunPoint_spr.put("deg0", spr[0]);
				sunPoint_spr.put("deg30", spr[1]);
				sunPoint_spr.put("deg45", spr[2]);
				sunPoint_spr.put("deg60", spr[3]);
				sunPoint_spr.put("deg90", spr[4]);
				sunPoint_spr.put("deg360", spr[5]);
				sunPoint_sum.put("deg0", sum[0]);
				sunPoint_sum.put("deg30", sum[1]);
				sunPoint_sum.put("deg45", sum[2]);
				sunPoint_sum.put("deg60", sum[3]);
				sunPoint_sum.put("deg90", sum[4]);
				sunPoint_sum.put("deg360", sum[5]);
				sunPoint_fal.put("deg0", fal[0]);
				sunPoint_fal.put("deg30", fal[1]);
				sunPoint_fal.put("deg45", fal[2]);
				sunPoint_fal.put("deg60", fal[3]);
				sunPoint_fal.put("deg90", fal[4]);
				sunPoint_fal.put("deg360", fal[5]);
				//System.out.println("File: " + entry.getName() + " Row: " + rownum);
				sunFile[0].put(sunPoint_anu);
				sunFile[1].put(sunPoint_win);
				sunFile[2].put(sunPoint_spr);
				sunFile[3].put(sunPoint_sum);
				sunFile[4].put(sunPoint_fal);
				//System.out.println("Done!");
			}
			for(int i = 0; i < 5; i++) {
				String filename = "";
				switch(i) {
				case 0: filename = "D:/Doraemon/Documents/CSC/485B/Solar Data/Solar JSON/Solar_anu.json"; break;
				case 1: filename = "D:/Doraemon/Documents/CSC/485B/Solar Data/Solar JSON/Solar_djf.json"; break;
				case 2: filename = "D:/Doraemon/Documents/CSC/485B/Solar Data/Solar JSON/Solar_mam.json"; break;
				case 3: filename = "D:/Doraemon/Documents/CSC/485B/Solar Data/Solar JSON/Solar_jja.json"; break;
				case 4: filename = "D:/Doraemon/Documents/CSC/485B/Solar Data/Solar JSON/Solar_son.json"; break;
				}
				Writer w = new FileWriter(filename);
				sunFile[i].write(w);
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
