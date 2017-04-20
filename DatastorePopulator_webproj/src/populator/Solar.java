package populator;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedList;
import java.util.List;
import java.util.Scanner;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;


public class Solar {
	DatastoreService datastore;
	List<Entity> data;
	
	public Solar() {
		datastore = DatastoreServiceFactory.getDatastoreService();
		data = new LinkedList<Entity>();
	}
	
	public void populate() {		
		try {
			InputStream input = new FileInputStream("dat/SolarData.zip");
			ZipInputStream zip = new ZipInputStream(input);
			@SuppressWarnings("unused")
			ZipEntry entry;
			
			while((entry = zip.getNextEntry()) != null) {
				@SuppressWarnings("resource")
				Scanner scanner = new Scanner(zip);
				scanner.nextLine();
				
				while (scanner.hasNextLine()) {
					String[] result = scanner.nextLine().split(",");
					Entity temp = new Entity("Solar");
					
					switch(result[3]) {
					case "January": temp.setProperty("month",1); break;
					case "February": temp.setProperty("month",2); break;
					case "March": temp.setProperty("month",3); break;
					case "April": temp.setProperty("month",4); break;
					case "May": temp.setProperty("month",5); break;
					case "June": temp.setProperty("month",6); break;
					case "July": temp.setProperty("month",7); break;
					case "August": temp.setProperty("month",8); break;
					case "September": temp.setProperty("month",9); break;
					case "October": temp.setProperty("month",10); break;
					case "November": temp.setProperty("month",11); break;
					case "December": temp.setProperty("month",12); break;
					default: temp.setProperty("month",13); break;
					}
					temp.setProperty("lat",Double.parseDouble(result[2]));
					temp.setProperty("lon",Double.parseDouble(result[1]));
					temp.setProperty("deg_0",Double.parseDouble(result[9]));
					temp.setProperty("deg_30",Double.parseDouble(result[7]));
					temp.setProperty("deg_45",Double.parseDouble(result[5]));
					temp.setProperty("deg_60",Double.parseDouble(result[6]));
					temp.setProperty("deg_90",Double.parseDouble(result[4]));
					temp.setProperty("deg_360",Double.parseDouble(result[8]));
					
					data.add(temp);
				}
	
			}
			
			datastore.put(data);
			
			zip.close();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		 
	}

	public static void main(String[] args) {
		Solar s = new Solar();
		s.populate();
	}
}
