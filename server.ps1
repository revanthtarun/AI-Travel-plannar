# Lightweight PowerShell REST API Web Server for AI Travel Budget Planner
$port = 8000
$root = $PSScriptRoot

if (-not $root) {
    $root = "C:\Users\chvas\OneDrive\Desktop\Budget palnner"
}

$tripsFile = Join-Path $root "trips.json"

# Helper to read database
function Read-TripsDb {
    if (Test-Path $tripsFile) {
        try {
            $content = [System.IO.File]::ReadAllText($tripsFile)
            if ([string]::IsNullOrWhiteSpace($content)) { return @() }
            return $content | ConvertFrom-Json
        } catch {
            return @()
        }
    }
    return @()
}

# Helper to write database
function Write-TripsDb($trips) {
    try {
        $json = $trips | ConvertTo-Json -Depth 10
        [System.IO.File]::WriteAllText($tripsFile, $json)
        return $true
    } catch {
        Write-Host "Error writing DB: $_"
        return $false
    }
}

# Dynamic budget logic
function Generate-BudgetMock($inputData) {
    $travelers = [int]$inputData.travelers
    if ($travelers -le 0) { $travelers = 1 }
    $days = [int]$inputData.days
    if ($days -le 0) { $days = 5 }
    $style = $inputData.travelStyle
    $shoppingBudget = [int]$inputData.shoppingBudget
    
    # Destination Factor
    $destFactor = 1.0
    $dest = ($inputData.destination).ToLower()
    if ($dest.Contains("paris") -or $dest.Contains("london") -or $dest.Contains("europe")) { $destFactor = 5.2 }
    elseif ($dest.Contains("singapore") -or $dest.Contains("dubai")) { $destFactor = 3.5 }
    elseif ($dest.Contains("maldives")) { $destFactor = 4.2 }
    elseif ($dest.Contains("goa") -or $dest.Contains("manali") -or $dest.Contains("shimla")) { $destFactor = 1.2 }

    # Lodging base
    $dailyHotelBase = 2500
    if ($inputData.hotelPreference -eq "Hostel") { $dailyHotelBase = 600 }
    elseif ($inputData.hotelPreference -eq "2-Star") { $dailyHotelBase = 1200 }
    elseif ($inputData.hotelPreference -eq "3-Star") { $dailyHotelBase = 2500 }
    elseif ($inputData.hotelPreference -eq "5-Star") { $dailyHotelBase = 7000 }

    # Food base
    $dailyFoodBase = 800
    if ($inputData.foodPreference -like "*Fine*") { $dailyFoodBase = 2000 }
    elseif ($inputData.foodPreference -like "*Veg*") { $dailyFoodBase = 600 }

    # Calculate style modifier
    $styleModifier = 1.0
    if ($style -eq "Luxury") { $styleModifier = 2.0 }
    elseif ($style -eq "Budget") { $styleModifier = 0.6 }

    # Calculate independent base fares for each transit mode
    $flightBase = 3500
    if ($style -eq "Luxury") { $flightBase = 12000 }
    elseif ($style -eq "Standard") { $flightBase = 6000 }
    $flightFare = [Math]::Round($flightBase * $travelers * $destFactor)

    $trainBase = 1000
    if ($style -eq "Luxury") { $trainBase = 4500 }
    elseif ($style -eq "Standard") { $trainBase = 2200 }
    $trainFare = [Math]::Round($trainBase * $travelers)

    $busBase = 800
    if ($style -eq "Luxury") { $busBase = 2500 }
    elseif ($style -eq "Standard") { $busBase = 1400 }
    $busFare = [Math]::Round($busBase * $travelers)

    $cabBase = 2000
    if ($style -eq "Luxury") { $cabBase = 7000 }
    elseif ($style -eq "Standard") { $cabBase = 4000 }
    $cabFare = [Math]::Round($cabBase * $travelers * $destFactor)

    # Set default transCost based on user preference
    $pref = $inputData.transportPreference
    if (-not $pref) { $pref = "Flight" }
    $transCost = $flightFare
    if ($pref -eq "Train") { $transCost = $trainFare }
    elseif ($pref -eq "Bus") { $transCost = $busFare }
    elseif ($pref -eq "Cab") { $transCost = $cabFare }

    $hotelCost = [Math]::Round($dailyHotelBase * $days * $styleModifier)
    $foodCost = [Math]::Round($dailyFoodBase * $days * $travelers * $styleModifier)
    
    # Local transit cost
    $localBase = 200
    if ($style -eq "Luxury") { $localBase = 1500 }
    elseif ($style -eq "Standard") { $localBase = 600 }
    $localCost = [Math]::Round($localBase * $days * $travelers * $destFactor)

    $activitiesCount = $inputData.activityInterests.Count
    if ($activitiesCount -le 0) { $activitiesCount = 2 }

    # Activities cost
    $activityBase = 600
    if ($style -eq "Luxury") { $activityBase = 3500 }
    elseif ($style -eq "Standard") { $activityBase = 1500 }
    $activitiesCost = [Math]::Round($activitiesCount * $activityBase * $travelers)

    $shoppingCost = $shoppingBudget
    $miscCost = [Math]::Round(($hotelCost + $foodCost) * 0.08)
    $emergencyCost = [Math]::Round(($transCost + $hotelCost) * 0.05)
    $total = $transCost + $hotelCost + $foodCost + $localCost + $activitiesCost + $shoppingCost + $miscCost + $emergencyCost

    $fromCity = $inputData.departureCity
    $toCity = $inputData.destination
    $destKey = $toCity.ToLower()

    $fromCode = $fromCity.SubString(0, [Math]::Min(3, $fromCity.Length)).ToUpper()
    $toCode = $toCity.SubString(0, [Math]::Min(3, $toCity.Length)).ToUpper()
    if ($fromCity.ToLower().Contains("hyderabad")) { $fromCode = "HYD" }
    if ($fromCity.ToLower().Contains("delhi")) { $fromCode = "DEL" }
    if ($fromCity.ToLower().Contains("goa")) { $fromCode = "GOI" }

    if ($destKey.Contains("goa")) { $toCode = "GOI" }
    elseif ($destKey.Contains("delhi")) { $toCode = "DEL" }
    elseif ($destKey.Contains("manali")) { $toCode = "BHU" }
    elseif ($destKey.Contains("paris")) { $toCode = "CDG" }

    # Setup transit/stay list based on destination
    if ($destKey.Contains("goa")) {
        $transOptions = @(
            [PSCustomObject]@{ name = "IndiGo Flight 6E-241 (Direct)"; type = "Flight"; time = "06:15 AM - 07:40 AM (1h 25m)"; price = $flightFare; details = "Direct flight. Dep: $fromCode, Arr: $toCode (Mopa GOX)." },
            [PSCustomObject]@{ name = "Air India AI-842 (Best Value)"; type = "Flight"; time = "11:30 AM - 01:05 PM (1h 35m)"; price = [Math]::Round($flightFare * 1.1); details = "Direct flight. In-flight hot meals included." },
            [PSCustomObject]@{ name = "Goa Express Train (12780)"; type = "Train"; time = "12:45 PM - 05:40 AM (+1) (16h 55m)"; price = $trainFare; details = "Third AC Sleeper berths (IRCTC reservations) to Madgaon Station." },
            [PSCustomObject]@{ name = "IntrCity SmartBus Sleeper (A/C)"; type = "Bus"; time = "05:30 PM - 08:30 AM (+1) (15h)"; price = $busFare; details = "Premium A/C Sleeper, charging ports, live tracking." },
            [PSCustomObject]@{ name = "Self-Drive SUV Rental / Road Cab"; type = "Cab"; time = "Flexible Departure"; price = $cabFare; details = "Private outstation door-to-door cab or self-drive vehicle." }
        )
        $hotelOptions = @(
            [PSCustomObject]@{ name = "Zostel Goa (Vagator Hostel)"; rating = "4.6"; reviews = "1.1k"; time = "Check-in: 12:00 PM"; price = [Math]::Round($hotelCost * 0.4); details = "Vibrant backpacker social beds, community cafe." },
            [PSCustomObject]@{ name = "Fairfield by Marriott Goa Baga (3-Star)"; rating = "4.2"; reviews = "850"; time = "Check-in: 02:00 PM"; price = [Math]::Round($hotelCost * 0.95); details = "Double room, swimming pool, complimentary buffet breakfast." },
            [PSCustomObject]@{ name = "Taj Exotica Resort & Spa Goa (5-Star)"; rating = "4.8"; reviews = "1.5k"; time = "Check-in: 02:00 PM"; price = [Math]::Round($hotelCost * 2.2); details = "Ocean-view luxury villas, private beach access in Benaulim." }
        )
        $foodOptions = @(
            [PSCustomObject]@{ name = "Beachside Fish Shacks (Baga)"; rating = "4.1"; reviews = "920"; cuisine = "Goan Seafood & Drinks"; tier = "₹"; time = "Lunch / Dinner"; price = [Math]::Round($foodCost * 0.5); details = "Budget seafood shacks offering authentic Goan vindaloo." },
            [PSCustomObject]@{ name = "Britto's Beach Cafe (Baga)"; rating = "4.3"; reviews = "1.4k"; cuisine = "Multi-Cuisine Seafood"; tier = "₹₹"; time = "Lunch / Dinner"; price = [Math]::Round($foodCost * 0.9); details = "Famous beach restaurant, popular for continental meals." },
            [PSCustomObject]@{ name = "The Fisherman's Wharf (Premium)"; rating = "4.6"; reviews = "2.1k"; cuisine = "Goan Premium Fusion"; tier = "₹₹₹"; time = "Dinner Buffet"; price = [Math]::Round($foodCost * 1.6); details = "Riverside fine dining, Goan fusion menus, live music tables." }
        )
    } elseif ($destKey.Contains("delhi")) {
        $transOptions = @(
            [PSCustomObject]@{ name = "Vistara Flight UK-812 (Direct)"; type = "Flight"; time = "07:30 AM - 09:40 AM (2h 10m)"; price = $flightFare; details = "Direct flight. Dep: $fromCode, Arr: $toCode (IGIA T3)." },
            [PSCustomObject]@{ name = "Nizamuddin Rajdhani Express (12437)"; type = "Train"; time = "12:45 PM - 05:55 AM (+1) (17h 10m)"; price = $trainFare; details = "Superfast premium 2nd AC sleeper, hot pantry meals." },
            [PSCustomObject]@{ name = "Zingbus Multi-Axle Sleeper (A/C)"; type = "Bus"; time = "04:30 PM - 09:30 AM (+1) (17h)"; price = $busFare; details = "Premium multi-axle sleeper bus, blankets and CCTV." },
            [PSCustomObject]@{ name = "Outstation Chauffeur Sedan Cab"; type = "Cab"; time = "Flexible Departure"; price = $cabFare; details = "Private door-to-door highway AC cab with professional driver." }
        )
        $hotelOptions = @(
            [PSCustomObject]@{ name = "Zostel Delhi (Paharganj Metro)"; rating = "4.5"; reviews = "940"; time = "Check-in: 12:00 PM"; price = [Math]::Round($hotelCost * 0.4); details = "Social dorms, co-working lounge, terrace cafe." },
            [PSCustomObject]@{ name = "Radisson Blu Connaught Place (3-Star)"; rating = "4.3"; reviews = "620"; time = "Check-in: 02:00 PM"; price = [Math]::Round($hotelCost * 0.95); details = "Executive room, central Delhi hub location." },
            [PSCustomObject]@{ name = "The Leela Palace New Delhi (5-Star)"; rating = "4.9"; reviews = "1.8k"; time = "Check-in: 02:00 PM"; price = [Math]::Round($hotelCost * 2.2); details = "Royal club rooms, rooftop infinity pool, butler service." }
        )
        $foodOptions = @(
            [PSCustomObject]@{ name = "Chandni Chowk Old Delhi Street Food"; rating = "4.5"; reviews = "2.5k"; cuisine = "North Indian Snacks"; tier = "₹"; time = "Lunch / Snacks"; price = [Math]::Round($foodCost * 0.4); details = "Paranthe Wali Gali, famous spicy chaat, jalebis." },
            [PSCustomObject]@{ name = "Connaught Place Popular Cafes"; rating = "4.4"; reviews = "1.1k"; cuisine = "Modern Fusion Bistro"; tier = "₹₹"; time = "Lunch / Dinner"; price = [Math]::Round($foodCost * 0.85); details = "Multi-cuisine dine-ins, local craft beers, and trendy continental." },
            [PSCustomObject]@{ name = "Bukhara - ITC Maurya (Fine Dining)"; rating = "4.8"; reviews = "3.2k"; cuisine = "North-West Frontier"; tier = "₹₹₹"; time = "Dinner Reservation"; price = [Math]::Round($foodCost * 1.8); details = "Iconic tandoori lamb leg and signature Dal Bukhara." }
        )
    } else {
        $transOptions = @(
            [PSCustomObject]@{ name = "SpiceJet / Akasa Air Flight"; type = "Flight"; time = "08:00 AM - 10:00 AM (2h)"; price = $flightFare; details = "Direct flight. Dep: $fromCode, Arr: $toCode." },
            [PSCustomObject]@{ name = "Express Mail Train AC 3-Tier Sleeper"; type = "Train"; time = "09:00 PM - 01:00 PM (+1) (16h)"; price = $trainFare; details = "Overnight journey. Third AC Sleeper berths (IRCTC reservations)." },
            [PSCustomObject]@{ name = "KSRTC / Sleeper Bus Operator"; type = "Bus"; time = "07:00 PM - 08:30 AM (+1) (13.5h)"; price = $busFare; details = "Overnight sleeper coach. A/C Sleeper berth with clean bed sheets." },
            [PSCustomObject]@{ name = "Self-Drive Car Rental / Road Cab"; type = "Cab"; time = "Flexible Departure"; price = $cabFare; details = "Standard sedan car outstation rental including toll fees." }
        )
        $hotelOptions = @(
            [PSCustomObject]@{ name = "Backpacker Social Hostel"; rating = "4.3"; reviews = "210"; time = "Check-in: 12:00 PM"; price = [Math]::Round($hotelCost * 0.4); details = "Shared bunk setups, high-speed Wi-Fi." },
            [PSCustomObject]@{ name = "Lemon Tree Premier (3-Star)"; rating = "4.1"; reviews = "850"; time = "Check-in: 02:00 PM"; price = [Math]::Round($hotelCost * 0.95); details = "Double room, business center, pool access." },
            [PSCustomObject]@{ name = "The Oberoi / ITC Grand (5-Star Luxury)"; rating = "4.8"; reviews = "1.1k"; time = "Check-in: 02:00 PM"; price = [Math]::Round($hotelCost * 2.2); details = "Chamber suites, butler services, swimming pools." }
        )
        $foodOptions = @(
            [PSCustomObject]@{ name = "Local Street Markets & Diners"; rating = "4.2"; reviews = "450"; cuisine = "Local Dishes"; tier = "₹"; time = "Lunch / Dinner"; price = [Math]::Round($foodCost * 0.5); details = "Popular regional food hubs, local snacks, and authentic dishes." },
            [PSCustomObject]@{ name = "Standard Casual Dine-in Cafes"; rating = "4.1"; reviews = "620"; cuisine = "Multi-Cuisine Buffet"; tier = "₹₹"; time = "Lunch / Dinner"; price = [Math]::Round($foodCost * 0.95); details = "Standard table service, popular local multi-cuisine buffet." },
            [PSCustomObject]@{ name = "Premium Family Dine-in"; rating = "4.6"; reviews = "890"; cuisine = "Heritage Gourmet"; tier = "₹₹₹"; time = "Dinner Reservation"; price = [Math]::Round($foodCost * 1.6); details = "Fine dining, live music tables, and upscale chef special dishes." }
        )
    }

    $localOptions = @(
        [PSCustomObject]@{ name = "Local City Auto-Rickshaw Rides"; time = "Point-to-point transit"; price = [Math]::Round($localCost * 0.3); details = "Standard local auto rides. Quick and highly accessible." },
        [PSCustomObject]@{ name = "Prepaid Ola/Uber App Cab"; time = "On-demand booking"; price = [Math]::Round($localCost * 0.9); details = "App-based flat rate local city rides. Fast and transparent." },
        [PSCustomObject]@{ name = "Self-Drive Car Rental Drive"; time = "Per day rental"; price = [Math]::Round($localCost * 1.6); details = "Flexible self-drive city car rental. Unlimited kilometers." }
    )

    $activityOptionsList = @(
        [PSCustomObject]@{ name = "Guided Local Monuments & Palace Pass"; time = "09:30 AM - 04:30 PM"; price = [Math]::Round($activitiesCost * 0.6); details = "Entry passes for palace fort museums, local art galleries." },
        [PSCustomObject]@{ name = "Popular Cultural Light & Sound Show"; time = "07:00 PM - 08:30 PM"; price = [Math]::Round($activitiesCost * 0.4); details = "Evening sound light show telling regional history, seats reserved." }
    )

    # Filter transportation options based on preferred transport mode
    $filteredTrans = @()
    foreach ($o in $transOptions) {
        if ($o.type -eq $pref) { $filteredTrans += $o }
    }
    if ($filteredTrans.Count -eq 0) {
        $filteredTrans = @($transOptions[0])
    }

    $transExplanation = "Roundtrip flight tickets from $fromCity to $toCity for $travelers pax."
    if ($pref -eq "Train") {
        $transExplanation = "Roundtrip express train reservations from $fromCity to $toCity for $travelers pax."
    } elseif ($pref -eq "Bus") {
        $transExplanation = "Overnight A/C Volvo sleeper bus reservations from $fromCity to $toCity for $travelers pax."
    } elseif ($pref -eq "Cab") {
        $transExplanation = "Outstation sedan or self-drive SUV rental from $fromCity to $toCity for $travelers pax."
    }

    $selectedTrans = $filteredTrans[0]
    foreach ($o in $filteredTrans) {
        if ($o.name.ToLower().Contains($pref.ToLower())) {
            $selectedTrans = $o
            break
        }
    }
    
    $selectedHotel = $hotelOptions[0]
    foreach ($o in $hotelOptions) {
        if ($o.name.ToLower().Contains($inputData.hotelPreference.ToLower())) {
            $selectedHotel = $o
            break
        }
    }

    $aiText = "Here is a custom budget plan generated by your native PowerShell Backend. Transit via $pref, and lodging at $($selectedHotel.name). Expand card details to select custom schedules."

    # Return Hashtable
    return @{
        totalBudget = $total
        aiExplanation = $aiText
        transportPreference = $pref
        categories = @{
            transportation = @{ cost = $transCost; explanation = $transExplanation; options = $filteredTrans; bookingProcess = "1. Click IRCTC/Airline booking portal.\n2. Complete ticket transaction." }
            hotel = @{ cost = $hotelCost; explanation = "Lodging at $($selectedHotel.name) for $days days."; options = $hotelOptions; bookingProcess = "1. Open booking portal.\n2. Make reservation for $days days." }
            food = @{ cost = $foodCost; explanation = "Dining allowance supporting $($inputData.foodPreference) style."; options = $foodOptions; bookingProcess = "1. Locate nearby restaurants.\n2. Dine in." }
            localTransport = @{ cost = $localCost; explanation = "Local transit: $($localOptions[0].name)."; options = $localOptions; bookingProcess = "1. Hire rentals locally.\n2. Follow local guidelines." }
            activities = @{ cost = $activitiesCost; explanation = "Sightseeing activities: $($activityOptionsList[0].name)."; options = $activityOptionsList; bookingProcess = "1. Purchase online admissions cards.\n2. Present QR code." }
            shopping = @{ cost = $shoppingCost; explanation = "Shopping allowance buffer cap."; options = @(); bookingProcess = "1. Pay local vendors." }
            miscellaneous = @{ cost = $miscCost; explanation = "Unforeseen buffer costs."; options = @(); bookingProcess = "1. Keep liquid cash buffer." }
            emergencyFund = @{ cost = $emergencyCost; explanation = "Safety cushion fund."; options = @(); bookingProcess = "1. Maintain savings cushion." }
        }
    }
}

# Create HttpListener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "============================================="
    Write-Host "   PowerShell REST API Backend Server"
    Write-Host "   Listening at: http://localhost:$port/"
    Write-Host "   Serving static & dynamic routes"
    Write-Host "   Saved logs database: trips.json"
    Write-Host "============================================="
} catch {
    Write-Host "Failed to start listener: $_"
    exit
}

# Serve requests in loop
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Add CORS Headers
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-API-Key")

        $urlPath = $request.Url.LocalPath
        $method = $request.HttpMethod

        # Handle Preflight Request
        if ($method -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        # ------------------------------------------------
        # API ENDPOINT: GET ALL TRIPS / GET SINGLE TRIP
        # ------------------------------------------------
        if ($urlPath -eq "/api/trips" -and $method -eq "GET") {
            $trips = Read-TripsDb
            $json = $trips | ConvertTo-Json -Depth 10
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            $response.ContentType = "application/json"
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        
        # ------------------------------------------------
        # API ENDPOINT: SAVE TRIP
        # ------------------------------------------------
        elseif ($urlPath -eq "/api/trips" -and $method -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream)
            $body = $reader.ReadToEnd()
            $trip = $body | ConvertFrom-Json
            
            if (-not $trip.id) {
                $trip | Add-Member -MemberType NoteProperty -Name "id" -Value ("trip_" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + "_" + [Guid]::NewGuid().ToString().SubString(0, 5))
                $trip | Add-Member -MemberType NoteProperty -Name "createdAt" -Value ([DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"))
            }
            if (-not $trip.updatedAt) {
                $trip | Add-Member -MemberType NoteProperty -Name "updatedAt" -Value ([DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")) -Force
            } else {
                $trip.updatedAt = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
            }

            $trips = Read-TripsDb
            $newTrips = @()
            $updated = $false
            foreach ($t in $trips) {
                if ($t.id -eq $trip.id) {
                    $newTrips += $trip
                    $updated = $true
                } else {
                    $newTrips += $t
                }
            }
            if (-not $updated) {
                $newTrips += $trip
            }

            $success = Write-TripsDb $newTrips
            $response.ContentType = "application/json"
            $respJson = $trip | ConvertTo-Json -Depth 10
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }

        # ------------------------------------------------
        # API ENDPOINT: DELETE TRIP / CLEAR ALL TRIPS
        # ------------------------------------------------
        elseif ($urlPath -eq "/api/trips" -and $method -eq "DELETE") {
            $id = $request.QueryString["id"]
            if ($id) {
                $trips = Read-TripsDb
                $filtered = @()
                foreach ($t in $trips) {
                    if ($t.id -ne $id) { $filtered += $t }
                }
                $success = Write-TripsDb $filtered
            } else {
                # Clear all
                $success = Write-TripsDb @()
            }
            
            $response.ContentType = "application/json"
            $respJson = '{"success": true}'
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($respJson)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }

        # ------------------------------------------------
        # API ENDPOINT: GENERATE BUDGET
        # ------------------------------------------------
        elseif ($urlPath -eq "/api/generate-budget" -and $method -eq "POST") {
            $reader = New-Object System.IO.StreamReader($request.InputStream)
            $body = $reader.ReadToEnd()
            $inputData = $body | ConvertFrom-Json

            $apiKey = $request.Headers["X-API-Key"]
            $budget = $null
            
            if ($apiKey) {
                # If client provides an API key, we proxy the request to Gemini on the server side!
                try {
                    $uri = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=$apiKey"
                    $prompt = "Estimate travel budget sheet for trip from $($inputData.departureCity) to $($inputData.destination) for $($inputData.days) days, travelers: $($inputData.travelers), style: $($inputData.travelStyle). Return ONLY valid raw JSON with totalBudget, aiExplanation summary, and categories object."
                    
                    $postBody = @{
                        contents = @(
                            @{
                                parts = @(
                                    @{ text = $prompt }
                                )
                            }
                        )
                    } | ConvertTo-Json -Depth 10

                    $result = Invoke-RestMethod -Uri $uri -Method POST -Body $postBody -ContentType "application/json"
                    $text = $result.candidates[0].content.parts[0].text
                    
                    # Clean markdown
                    $cleanJson = $text -replace '(?s)```json\s*(.*?)\s*```', '$1'
                    $cleanJson = $cleanJson.Trim()
                    
                    $response.ContentType = "application/json"
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($cleanJson)
                    $response.ContentLength64 = $bytes.Length
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                    $response.Close()
                    continue
                } catch {
                    Write-Host "Gemini API Proxy call failed, falling back to mock budget generator: $_"
                }
            }

            # If no API key or API call failed -> Generate Mock Budget
            $budget = Generate-BudgetMock $inputData
            $json = $budget | ConvertTo-Json -Depth 10
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            $response.ContentType = "application/json"
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }

        # ------------------------------------------------
        # STATIC FILES ROUTER
        # ------------------------------------------------
        else {
            if ($urlPath -eq "/") {
                $urlPath = "/index.html"
            }
            $urlPath = $urlPath.Replace("/", "\")
            $filePath = Join-Path $root $urlPath

            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = "application/octet-stream"
                if ($ext -eq ".html" -or $ext -eq ".htm") { $contentType = "text/html; charset=utf-8" }
                elseif ($ext -eq ".css") { $contentType = "text/css" }
                elseif ($ext -eq ".js") { $contentType = "application/javascript" }
                elseif ($ext -eq ".png") { $contentType = "image/png" }
                elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
                elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
                elseif ($ext -eq ".json") { $contentType = "application/json" }

                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 File Not Found: $urlPath")
                $response.ContentType = "text/plain"
                $response.ContentLength64 = $errBytes.Length
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
        }
    } catch {
        Write-Host "Request processing error: $_"
    } finally {
        if ($response) {
            try { $response.Close() } catch {}
        }
    }
}
