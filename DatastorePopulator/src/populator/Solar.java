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
					
					temp.setProperty("month",result[3]);
					temp.setProperty("lat",result[2]);
					temp.setProperty("lon",result[1]);
					temp.setProperty("deg_0",result[9]);
					temp.setProperty("deg_30",result[7]);
					temp.setProperty("deg_45",result[5]);
					temp.setProperty("deg_60",result[6]);
					temp.setProperty("deg_90",result[4]);
					temp.setProperty("deg_360",result[8]);
					
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
