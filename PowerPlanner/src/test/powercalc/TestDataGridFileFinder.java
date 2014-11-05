package test.powercalc;
import main.powercalc.DatabaseFileFInder;

import com.powerplanner.*;

public class TestDataGridFileFinder {
	String arr[];

    public static void main(String[] args) {
       DatabaseFileFInder dataGridFileFinder = new DatabaseFileFInder();
    dataGridFileFinder.windFileFinder(48.463083,123.310996,48.463083,123.310996,"anu");
  dataGridFileFinder.displayWindReturnarr();
    dataGridFileFinder.solarFileFinder("Apr");
    dataGridFileFinder.displaySolarFileList();

    }
}