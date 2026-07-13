const express = require('express');
const router = express.Router();

const ALL_CITIES = [
  // Andhra Pradesh & Telangana
  { name: 'Hyderabad', code: 'HYD', country: 'India', desc: 'Rajiv Gandhi Intl Airport' },
  { name: 'Visakhapatnam', code: 'VTZ', country: 'India', desc: 'Vizag Airport (Andhra Pradesh)' },
  { name: 'Vijayawada', code: 'VGA', country: 'India', desc: 'Vijayawada Airport (Andhra Pradesh)' },
  { name: 'Tirupati', code: 'TIR', country: 'India', desc: 'Tirupati Airport (Andhra Pradesh)' },
  { name: 'Rajahmundry', code: 'RJA', country: 'India', desc: 'Rajahmundry Airport' },
  { name: 'Warangal', code: 'WGL', country: 'India', desc: 'Warangal, Telangana' },
  { name: 'Nellore', code: 'NLR', country: 'India', desc: 'Nellore, Andhra Pradesh' },
  { name: 'Kurnool', code: 'KRN', country: 'India', desc: 'Kurnool, Andhra Pradesh' },
  { name: 'Kakinada', code: 'KAK', country: 'India', desc: 'Kakinada, Andhra Pradesh' },
  { name: 'Guntur', code: 'GNT', country: 'India', desc: 'Guntur, Andhra Pradesh' },
  // Tamil Nadu
  { name: 'Chennai', code: 'MAA', country: 'India', desc: 'Chennai Intl Airport' },
  { name: 'Coimbatore', code: 'CJB', country: 'India', desc: 'Coimbatore Intl Airport' },
  { name: 'Madurai', code: 'IXM', country: 'India', desc: 'Madurai Airport' },
  { name: 'Trichy', code: 'TRZ', country: 'India', desc: 'Tiruchirappalli Intl Airport' },
  { name: 'Salem', code: 'SXV', country: 'India', desc: 'Salem Airport, Tamil Nadu' },
  { name: 'Ooty', code: 'OTY', country: 'India', desc: 'Ooty (Nilgiris), Tamil Nadu' },
  { name: 'Vellore', code: 'VLR', country: 'India', desc: 'Vellore, Tamil Nadu' },
  { name: 'Thanjavur', code: 'TJV', country: 'India', desc: 'Thanjavur, Tamil Nadu' },
  { name: 'Kanyakumari', code: 'KNY', country: 'India', desc: 'Kanyakumari, Tamil Nadu' },
  // Karnataka
  { name: 'Bangalore', code: 'BLR', country: 'India', desc: 'Kempegowda Intl Airport' },
  { name: 'Mysore', code: 'MYQ', country: 'India', desc: 'Mysore Airport, Karnataka' },
  { name: 'Mangalore', code: 'IXE', country: 'India', desc: 'Mangalore Intl Airport' },
  { name: 'Hubli', code: 'HBX', country: 'India', desc: 'Hubli Airport, Karnataka' },
  { name: 'Hampi', code: 'HMP', country: 'India', desc: 'Hampi, Karnataka (UNESCO Site)' },
  { name: 'Coorg', code: 'CRG', country: 'India', desc: 'Coorg (Kodagu), Karnataka' },
  // Kerala
  { name: 'Kochi', code: 'COK', country: 'India', desc: 'Cochin Intl Airport' },
  { name: 'Thiruvananthapuram', code: 'TRV', country: 'India', desc: 'Trivandrum Intl Airport' },
  { name: 'Kozhikode', code: 'CCJ', country: 'India', desc: 'Calicut Intl Airport' },
  { name: 'Munnar', code: 'MNR', country: 'India', desc: 'Munnar Hill Station, Kerala' },
  { name: 'Alleppey', code: 'ALP', country: 'India', desc: 'Alappuzha (Backwaters), Kerala' },
  { name: 'Thrissur', code: 'TCR', country: 'India', desc: 'Thrissur, Kerala' },
  // Goa
  { name: 'Goa', code: 'GOI', country: 'India', desc: 'Dabolim / Mopa Airport' },
  // Maharashtra
  { name: 'Mumbai', code: 'BOM', country: 'India', desc: 'Chhatrapati Shivaji Maharaj Intl' },
  { name: 'Pune', code: 'PNQ', country: 'India', desc: 'Pune Intl Airport' },
  { name: 'Nagpur', code: 'NAG', country: 'India', desc: 'Dr. Babasaheb Ambedkar Intl Airport' },
  { name: 'Aurangabad', code: 'IXU', country: 'India', desc: 'Aurangabad Airport (Ajanta/Ellora)' },
  { name: 'Nashik', code: 'ISK', country: 'India', desc: 'Nashik, Maharashtra' },
  { name: 'Kolhapur', code: 'KLH', country: 'India', desc: 'Kolhapur Airport, Maharashtra' },
  // Delhi & NCR
  { name: 'Delhi', code: 'DEL', country: 'India', desc: 'Indira Gandhi Intl Airport' },
  { name: 'Agra', code: 'AGR', country: 'India', desc: 'Agra Airport (Taj Mahal)' },
  { name: 'Noida', code: 'NOI', country: 'India', desc: 'Noida, Uttar Pradesh' },
  { name: 'Gurgaon', code: 'GGN', country: 'India', desc: 'Gurugram, Haryana' },
  // Rajasthan
  { name: 'Jaipur', code: 'JAI', country: 'India', desc: 'Jaipur Intl Airport' },
  { name: 'Udaipur', code: 'UDR', country: 'India', desc: 'Maharana Pratap Airport' },
  { name: 'Jodhpur', code: 'JDH', country: 'India', desc: 'Jodhpur Airport' },
  { name: 'Jaisalmer', code: 'JSA', country: 'India', desc: 'Jaisalmer Airport (Desert City)' },
  { name: 'Ajmer', code: 'AJM', country: 'India', desc: 'Ajmer, Rajasthan' },
  { name: 'Pushkar', code: 'PSK', country: 'India', desc: 'Pushkar, Rajasthan' },
  // Gujarat
  { name: 'Ahmedabad', code: 'AMD', country: 'India', desc: 'Sardar Vallabhbhai Patel Intl' },
  { name: 'Surat', code: 'STV', country: 'India', desc: 'Surat Airport, Gujarat' },
  { name: 'Vadodara', code: 'BDQ', country: 'India', desc: 'Vadodara Airport, Gujarat' },
  { name: 'Rajkot', code: 'RAJ', country: 'India', desc: 'Rajkot Airport, Gujarat' },
  // Himachal Pradesh & Uttarakhand
  { name: 'Manali', code: 'KUU', country: 'India', desc: 'Bhuntar Airport (Kullu-Manali)' },
  { name: 'Shimla', code: 'SLV', country: 'India', desc: 'Shimla Airport, Himachal Pradesh' },
  { name: 'Dharamshala', code: 'DHM', country: 'India', desc: 'Gaggal Airport (McLeod Ganj)' },
  { name: 'Dehradun', code: 'DED', country: 'India', desc: 'Jolly Grant Airport, Uttarakhand' },
  { name: 'Rishikesh', code: 'RSK', country: 'India', desc: 'Rishikesh, Uttarakhand' },
  { name: 'Haridwar', code: 'HDW', country: 'India', desc: 'Haridwar, Uttarakhand' },
  { name: 'Mussoorie', code: 'MSR', country: 'India', desc: 'Mussoorie Hill Station, Uttarakhand' },
  { name: 'Nainital', code: 'NNT', country: 'India', desc: 'Nainital, Uttarakhand' },
  // Punjab & Haryana
  { name: 'Amritsar', code: 'ATQ', country: 'India', desc: 'Sri Guru Ram Dass Jee Intl' },
  { name: 'Chandigarh', code: 'IXC', country: 'India', desc: 'Chandigarh Airport' },
  { name: 'Ludhiana', code: 'LUH', country: 'India', desc: 'Ludhiana Airport, Punjab' },
  // J&K & Ladakh
  { name: 'Srinagar', code: 'SXR', country: 'India', desc: 'Sheikh ul-Alam Intl Airport' },
  { name: 'Leh', code: 'IXL', country: 'India', desc: 'Kushok Bakula Rimpochee Airport' },
  { name: 'Jammu', code: 'IXJ', country: 'India', desc: 'Jammu Airport' },
  // West Bengal & Northeast
  { name: 'Kolkata', code: 'CCU', country: 'India', desc: 'Netaji Subhash Chandra Bose Intl' },
  { name: 'Darjeeling', code: 'DAR', country: 'India', desc: 'Darjeeling, West Bengal' },
  { name: 'Siliguri', code: 'IXB', country: 'India', desc: 'Bagdogra Airport, West Bengal' },
  { name: 'Guwahati', code: 'GAU', country: 'India', desc: 'Lokpriya Gopinath Bordoloi Intl' },
  { name: 'Shillong', code: 'SHL', country: 'India', desc: 'Shillong Airport, Meghalaya' },
  { name: 'Gangtok', code: 'GTK', country: 'India', desc: 'Gangtok, Sikkim' },
  { name: 'Imphal', code: 'IMF', country: 'India', desc: 'Bir Tikendrajit Intl Airport' },
  // Odisha & Jharkhand
  { name: 'Bhubaneswar', code: 'BBI', country: 'India', desc: 'Biju Patnaik Intl Airport' },
  { name: 'Puri', code: 'PRI', country: 'India', desc: 'Puri, Odisha (Jagannath Temple)' },
  { name: 'Ranchi', code: 'IXR', country: 'India', desc: 'Birsa Munda Airport, Jharkhand' },
  // Madhya Pradesh & Chhattisgarh
  { name: 'Bhopal', code: 'BHO', country: 'India', desc: 'Raja Bhoj Airport, MP' },
  { name: 'Indore', code: 'IDR', country: 'India', desc: 'Devi Ahilya Bai Holkar Airport' },
  { name: 'Khajuraho', code: 'HJR', country: 'India', desc: 'Khajuraho Airport (UNESCO Temples)' },
  { name: 'Raipur', code: 'RPR', country: 'India', desc: 'Swami Vivekananda Airport' },
  // Uttar Pradesh
  { name: 'Lucknow', code: 'LKO', country: 'India', desc: 'Chaudhary Charan Singh Intl' },
  { name: 'Varanasi', code: 'VNS', country: 'India', desc: 'Lal Bahadur Shastri Intl Airport' },
  { name: 'Prayagraj', code: 'IXD', country: 'India', desc: 'Prayagraj Airport (Allahabad)' },
  { name: 'Mathura', code: 'MTH', country: 'India', desc: 'Mathura, Uttar Pradesh' },
  // Islands
  { name: 'Andaman', code: 'IXZ', country: 'India', desc: 'Veer Savarkar Intl Airport' },
  { name: 'Lakshadweep', code: 'AGX', country: 'India', desc: 'Agatti Island Airport' },
  // International
  { name: 'Dubai', code: 'DXB', country: 'UAE', desc: 'Dubai Intl Airport' },
  { name: 'Abu Dhabi', code: 'AUH', country: 'UAE', desc: 'Zayed Intl Airport' },
  { name: 'Singapore', code: 'SIN', country: 'Singapore', desc: 'Changi Airport' },
  { name: 'Bangkok', code: 'BKK', country: 'Thailand', desc: 'Suvarnabhumi Airport' },
  { name: 'Phuket', code: 'HKT', country: 'Thailand', desc: 'Phuket Intl Airport' },
  { name: 'Kuala Lumpur', code: 'KUL', country: 'Malaysia', desc: 'KLIA Airport' },
  { name: 'Bali', code: 'DPS', country: 'Indonesia', desc: 'Ngurah Rai Intl Airport' },
  { name: 'Colombo', code: 'CMB', country: 'Sri Lanka', desc: 'Bandaranaike Intl Airport' },
  { name: 'Kathmandu', code: 'KTM', country: 'Nepal', desc: 'Tribhuvan Intl Airport' },
  { name: 'Maldives', code: 'MLE', country: 'Maldives', desc: 'Velana Intl Airport' },
  { name: 'Paris', code: 'CDG', country: 'France', desc: 'Charles de Gaulle Airport' },
  { name: 'London', code: 'LHR', country: 'United Kingdom', desc: 'Heathrow Airport' },
  { name: 'Tokyo', code: 'NRT', country: 'Japan', desc: 'Narita Intl Airport' },
  { name: 'New York', code: 'JFK', country: 'United States', desc: 'JFK Intl Airport' },
  { name: 'Sydney', code: 'SYD', country: 'Australia', desc: 'Kingsford Smith Airport' },
  { name: 'Toronto', code: 'YYZ', country: 'Canada', desc: 'Pearson Intl Airport' },
  { name: 'Frankfurt', code: 'FRA', country: 'Germany', desc: 'Frankfurt Airport' },
  { name: 'Amsterdam', code: 'AMS', country: 'Netherlands', desc: 'Schiphol Airport' },
  { name: 'Zurich', code: 'ZRH', country: 'Switzerland', desc: 'Zurich Airport' },
  { name: 'Rome', code: 'FCO', country: 'Italy', desc: 'Leonardo da Vinci Airport' },
  { name: 'Barcelona', code: 'BCN', country: 'Spain', desc: 'El Prat Airport' },
  { name: 'Istanbul', code: 'IST', country: 'Turkey', desc: 'Istanbul Airport' },
  { name: 'Hong Kong', code: 'HKG', country: 'Hong Kong', desc: 'Hong Kong Intl Airport' },
  { name: 'Seoul', code: 'ICN', country: 'South Korea', desc: 'Incheon Intl Airport' },
  { name: 'Beijing', code: 'PEK', country: 'China', desc: 'Capital Intl Airport' },
  { name: 'Doha', code: 'DOH', country: 'Qatar', desc: 'Hamad Intl Airport' },
  { name: 'Muscat', code: 'MCT', country: 'Oman', desc: 'Muscat Intl Airport' },
];

router.get('/', (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) return res.json(ALL_CITIES.slice(0, 8));
  const query = q.toLowerCase().trim();
  const filtered = ALL_CITIES.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.code.toLowerCase().includes(query) ||
    c.country.toLowerCase().includes(query) ||
    c.desc.toLowerCase().includes(query)
  );
  res.json(filtered.slice(0, 12));
});

module.exports = router;
