// Horizon Jets — airport database for the Range Map (v2)
// Standard public IATA airport data (code, city, coordinates).
// Includes every airport code used in the aircraft Popular Routes data,
// plus Southwest Florida home airports and major US + international hubs.
// Coordinates are decimal degrees (latitude, longitude).
var HJ_AIRPORTS = [
  // Southwest Florida (home region)
  {code:"APF", city:"Naples, FL", name:"Naples Municipal", lat:26.1526, lon:-81.7753, region:"Southwest Florida"},
  {code:"FMY", city:"Fort Myers, FL", name:"Page Field", lat:26.5872, lon:-81.8633, region:"Southwest Florida"},
  {code:"RSW", city:"Fort Myers, FL", name:"Southwest Florida Intl", lat:26.5362, lon:-81.7552, region:"Southwest Florida"},
  {code:"PGD", city:"Punta Gorda, FL", name:"Punta Gorda", lat:26.9197, lon:-81.9905, region:"Southwest Florida"},
  {code:"SRQ", city:"Sarasota, FL", name:"Sarasota Bradenton Intl", lat:27.3954, lon:-82.5544, region:"Southwest Florida"},
  // Florida
  {code:"MIA", city:"Miami, FL", name:"Miami Intl", lat:25.7959, lon:-80.2870, region:"Florida"},
  {code:"FLL", city:"Fort Lauderdale, FL", name:"Fort Lauderdale-Hollywood Intl", lat:26.0726, lon:-80.1527, region:"Florida"},
  {code:"PBI", city:"West Palm Beach, FL", name:"Palm Beach Intl", lat:26.6832, lon:-80.0956, region:"Florida"},
  {code:"MCO", city:"Orlando, FL", name:"Orlando Intl", lat:28.4312, lon:-81.3081, region:"Florida"},
  {code:"TPA", city:"Tampa, FL", name:"Tampa Intl", lat:27.9755, lon:-82.5332, region:"Florida"},
  {code:"JAX", city:"Jacksonville, FL", name:"Jacksonville Intl", lat:30.4941, lon:-81.6879, region:"Florida"},
  // US East
  {code:"JFK", city:"New York, NY", name:"John F. Kennedy Intl", lat:40.6413, lon:-73.7781, region:"US East"},
  {code:"TEB", city:"New York (Teterboro), NJ", name:"Teterboro", lat:40.8501, lon:-74.0608, region:"US East"},
  {code:"EWR", city:"Newark, NJ", name:"Newark Liberty Intl", lat:40.6895, lon:-74.1745, region:"US East"},
  {code:"LGA", city:"New York, NY", name:"LaGuardia", lat:40.7769, lon:-73.8740, region:"US East"},
  {code:"BOS", city:"Boston, MA", name:"Boston Logan Intl", lat:42.3656, lon:-71.0096, region:"US East"},
  {code:"DCA", city:"Washington, DC", name:"Ronald Reagan National", lat:38.8512, lon:-77.0402, region:"US East"},
  {code:"IAD", city:"Washington, DC", name:"Washington Dulles Intl", lat:38.9531, lon:-77.4565, region:"US East"},
  {code:"BWI", city:"Baltimore, MD", name:"Baltimore/Washington Intl", lat:39.1774, lon:-76.6684, region:"US East"},
  {code:"CLT", city:"Charlotte, NC", name:"Charlotte Douglas Intl", lat:35.2144, lon:-80.9473, region:"US East"},
  {code:"ATL", city:"Atlanta, GA", name:"Hartsfield-Jackson Intl", lat:33.6407, lon:-84.4277, region:"US East"},
  {code:"BNA", city:"Nashville, TN", name:"Nashville Intl", lat:36.1245, lon:-86.6782, region:"US East"},
  // US Central
  {code:"ORD", city:"Chicago, IL", name:"Chicago O'Hare Intl", lat:41.9742, lon:-87.9073, region:"US Central"},
  {code:"MDW", city:"Chicago, IL", name:"Chicago Midway Intl", lat:41.7868, lon:-87.7522, region:"US Central"},
  {code:"DTW", city:"Detroit, MI", name:"Detroit Metropolitan", lat:42.2124, lon:-83.3534, region:"US Central"},
  {code:"MSP", city:"Minneapolis, MN", name:"Minneapolis-St. Paul Intl", lat:44.8819, lon:-93.2218, region:"US Central"},
  {code:"STL", city:"St. Louis, MO", name:"St. Louis Lambert Intl", lat:38.7487, lon:-90.3700, region:"US Central"},
  {code:"MEM", city:"Memphis, TN", name:"Memphis Intl", lat:35.0424, lon:-89.9767, region:"US Central"},
  {code:"DFW", city:"Dallas, TX", name:"Dallas/Fort Worth Intl", lat:32.8998, lon:-97.0403, region:"US Central"},
  {code:"DAL", city:"Dallas, TX", name:"Dallas Love Field", lat:32.8471, lon:-96.8518, region:"US Central"},
  {code:"IAH", city:"Houston, TX", name:"George Bush Intercontinental", lat:29.9902, lon:-95.3368, region:"US Central"},
  {code:"HOU", city:"Houston, TX", name:"William P. Hobby", lat:29.6454, lon:-95.2789, region:"US Central"},
  {code:"AUS", city:"Austin, TX", name:"Austin-Bergstrom Intl", lat:30.1945, lon:-97.6699, region:"US Central"},
  // US West
  {code:"LAX", city:"Los Angeles, CA", name:"Los Angeles Intl", lat:33.9425, lon:-118.4081, region:"US West"},
  {code:"VNY", city:"Los Angeles (Van Nuys), CA", name:"Van Nuys", lat:34.2098, lon:-118.4900, region:"US West"},
  {code:"SFO", city:"San Francisco, CA", name:"San Francisco Intl", lat:37.6213, lon:-122.3790, region:"US West"},
  {code:"SAN", city:"San Diego, CA", name:"San Diego Intl", lat:32.7338, lon:-117.1933, region:"US West"},
  {code:"LAS", city:"Las Vegas, NV", name:"Harry Reid Intl", lat:36.0840, lon:-115.1537, region:"US West"},
  {code:"PHX", city:"Phoenix, AZ", name:"Phoenix Sky Harbor Intl", lat:33.4373, lon:-112.0078, region:"US West"},
  {code:"DEN", city:"Denver, CO", name:"Denver Intl", lat:39.8561, lon:-104.6737, region:"US West"},
  {code:"SEA", city:"Seattle, WA", name:"Seattle-Tacoma Intl", lat:47.4502, lon:-122.3088, region:"US West"},
  {code:"PDX", city:"Portland, OR", name:"Portland Intl", lat:45.5898, lon:-122.5951, region:"US West"},
  {code:"SLC", city:"Salt Lake City, UT", name:"Salt Lake City Intl", lat:40.7899, lon:-111.9791, region:"US West"},
  {code:"RNO", city:"Reno, NV", name:"Reno-Tahoe Intl", lat:39.4986, lon:-119.7681, region:"US West"},
  // International
  {code:"LHR", city:"London, UK", name:"London Heathrow", lat:51.4700, lon:-0.4543, region:"International"},
  {code:"CDG", city:"Paris, France", name:"Paris Charles de Gaulle", lat:49.0097, lon:2.5479, region:"International"},
  {code:"DXB", city:"Dubai, UAE", name:"Dubai Intl", lat:25.2532, lon:55.3657, region:"International"},
  {code:"SIN", city:"Singapore", name:"Singapore Changi", lat:1.3644, lon:103.9915, region:"International"},
  {code:"HKG", city:"Hong Kong", name:"Hong Kong Intl", lat:22.3080, lon:113.9185, region:"International"},
  {code:"HND", city:"Tokyo, Japan", name:"Tokyo Haneda", lat:35.5494, lon:139.7798, region:"International"},
  {code:"JNB", city:"Johannesburg, South Africa", name:"O.R. Tambo Intl", lat:-26.1367, lon:28.2411, region:"International"},
  {code:"YYZ", city:"Toronto, Canada", name:"Toronto Pearson Intl", lat:43.6777, lon:-79.6248, region:"International"},
  {code:"YVR", city:"Vancouver, Canada", name:"Vancouver Intl", lat:49.1967, lon:-123.1815, region:"International"},
  {code:"CUN", city:"Cancun, Mexico", name:"Cancun Intl", lat:21.0365, lon:-86.8771, region:"International"},
  {code:"NAS", city:"Nassau, Bahamas", name:"Lynden Pindling Intl", lat:25.0390, lon:-77.4662, region:"International"}
];
