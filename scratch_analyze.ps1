$reviews = Import-Csv "..\Blinkit Gradution Project\reviews_raw.csv"
$electronics = $reviews | Where-Object { $_.category -eq "electronics" }

# Compute average rating (only from reviews that have ratings)
$rated = $electronics | Where-Object { $_.rating -ne "" -and $_.rating -ne $null }
Write-Host "Electronics with ratings:" $rated.Count "out of" $electronics.Count
$avgRating = ($rated | Measure-Object -Property rating -Average).Average
Write-Host "Average rating:" ([math]::Round($avgRating, 2))

# Sentiment analysis: count positive vs negative reviews (simple keyword heuristic for curation)
$positive = 0
$negative = 0
$neutral = 0
foreach ($r in $electronics) {
    $t = $r.text.ToLower()
    if ($t -match "good|great|excellent|love|happy|fast|best|recommend|perfect|nice|awesome|satisfied|working fine") {
        $positive++
    } elseif ($t -match "bad|worst|terrible|faulty|defective|damaged|not working|broken|scam|fraud|never|poor|disappointing|waste") {
        $negative++
    } else {
        $neutral++
    }
}
Write-Host "`nSentiment breakdown:"
Write-Host "Positive:" $positive "(" ([math]::Round(($positive/$electronics.Count)*100,1)) "%)"
Write-Host "Negative:" $negative "(" ([math]::Round(($negative/$electronics.Count)*100,1)) "%)"
Write-Host "Neutral:" $neutral "(" ([math]::Round(($neutral/$electronics.Count)*100,1)) "%)"

# Complaint types for electronics from consumer_forum_complaints
Write-Host "`n--- Consumer Forum Complaints for Electronics ---"
$complaints = Import-Csv "..\Blinkit Gradution Project\consumer_forum_complaints.csv"
$elecComplaints = $complaints | Where-Object { $_.category -eq "electronics" }
Write-Host "Total electronics complaints:" $elecComplaints.Count
$elecComplaints | Group-Object complaint_type -NoElement | Sort-Object Count -Descending | Format-Table -AutoSize

# Look for positive electronics reviews to find what works
Write-Host "`nPositive electronics reviews (rating >= 4):"
$posReviews = $electronics | Where-Object { $_.rating -ge 4 }
Write-Host "Count:" $posReviews.Count
$posReviews | Select-Object -First 5 | ForEach-Object {
    $textLen = [Math]::Min(250, $_.text.Length)
    Write-Host ("Rating: " + $_.rating + " | " + $_.text.Substring(0, $textLen))
    Write-Host "---"
}

# Common product mentions in electronics
Write-Host "`nCommon product types mentioned in electronics reviews:"
$keywords = @("earphone","earbuds","cable","charger","speaker","fan","light","bulb","power bank","headphone","mouse","keyboard","trimmer","watch","camera","adapter","extension","led")
foreach ($kw in $keywords) {
    $count = ($electronics | Where-Object { $_.text -match $kw }).Count
    if ($count -gt 0) {
        Write-Host "$kw : $count mentions"
    }
}
