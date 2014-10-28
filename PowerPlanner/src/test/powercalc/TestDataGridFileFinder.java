package test.powercalc;
import com.powerplanner.*;

public class TestDataGridFileFinder {
	String arr[];

    public static void main(String[] args) {
       DataGridFileFinder dataGridFileFinder = new DataGridFileFinder();
    dataGridFileFinder.fileFinder(48.463083,123.310996,48.463083,123.310996);
    dataGridFileFinder.displayFileList();
    }
}
