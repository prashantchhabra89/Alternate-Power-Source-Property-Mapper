package test.powercalc;
import main.powercalc.DatabaseFileFinder;

public class TestDataGridFileFinder {
	String arr[];

    public static void main(String[] args) {
       DatabaseFileFinder dataGridFileFinder = new DatabaseFileFinder();
    dataGridFileFinder.windFileFinder(48.463083,123.310996,48.463083,123.310996,"anu");
  dataGridFileFinder.displayWindReturnarr();
    dataGridFileFinder.solarFileFinder("Apr");
    dataGridFileFinder.displaySolarFileList();

    }
}