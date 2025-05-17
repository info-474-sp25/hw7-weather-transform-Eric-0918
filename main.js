// SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create the SVG container and group element for the chart
const svgLine = d3.select("#lineChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


// LOAD AND TRANSFORM DATA
d3.csv("weather.csv").then(data => {
    // --- CASE 1: FLATTEN ---
    // Fields:
    // - X: year
    // - Y: average_precipitation
    // - Category: city

    // 1.1: Rename and reformat
    data.forEach(d => {
        d.year = new Date(d.date).getFullYear(); // Get year from date
        d.precip = +d.average_precipitation; // Convert precipitation to numeric
        d.city = d.city; // ensure city field exists
    }); 

    console.log("=== CASE 1: FLATTEN ===");
    console.log("Raw data:", data);

    // 1.2: No filter
    const filteredData1 = data;

    console.log("Filtered data 1:", filteredData1);

    // 1.3: GROUP AND AGGREGATE
    const groupedData1 = Array.from(
        d3.rollup(
            filteredData1,
            v => d3.mean(v, d => d.precip),
            d => d.city,
            d => d.year
        ),
        ([city, yearMap]) => Array.from(yearMap, ([year, avgPrecip]) => ({
            city,
            year,
            avgPrecip
        }))
    ).flat();

    console.log("Grouped data 1:", groupedData1);

    // 1.4: FLATTEN
    const flattenedData = groupedData1.map(d => ({
        year: d.year,
        avgPrecipitation: d.avgPrecip,
        city: d.city
    }));

    console.log("Final flattened data:", flattenedData);
    console.log("---------------------------------------------------------------------");

    // --- CASE 2: PIVOT ---

    // 2.1: Rename and reformat
    data.forEach(d => {
        d.year = new Date(d.date).getFullYear();
        d.month = new Date(d.date).getMonth() + 1;
        d.actualPrecip = +d.actual_precipitation;
        d.avgPrecip = +d.average_precipitation;
        d.recordPrecip = +d.record_precipitation;
    });

    console.log("=== CASE 2: PIVOT ===");
    console.log("Raw data:", data);

    // 2.2: Filter for 2014
    const filteredData2 = data.filter(d => d.year === 2014);

    console.log("Filtered data 2:", filteredData2);

    // 2.3: Group and aggregate by month
    const groupedData2 = d3.groups(filteredData2, d => d.month)
        .map(([month, entries]) => ({
            month,
            avgActualPrecip: d3.mean(entries, d => d.actualPrecip),
            avgAvgPrecip: d3.mean(entries, d => d.avgPrecip),
            avgRecordPrecip: d3.mean(entries, d => d.recordPrecip)
        }));

    console.log("Grouped data 2:", groupedData2);

    // 2.4: FLATTEN (pivot format)
    const pivotedData = groupedData2.flatMap(d => [
        { month: d.month, precipitation: d.avgActualPrecip, type: "Actual" },
        { month: d.month, precipitation: d.avgAvgPrecip, type: "Average" },
        { month: d.month, precipitation: d.avgRecordPrecip, type: "Record" }
    ]);

    console.log("Final pivoted data:", pivotedData);
});
