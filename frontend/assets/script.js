var sizeFunction = function (x) {
    var y = Math.sqrt(x) + 0.1;
    return y * 80;
};

//// https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript////
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showChart(data) {
    //alert(data.avg_similarity);
    document.getElementById('bubble_chart').hidden=false
    document.getElementById('insigts_stats').hidden=false
    document.getElementById('similarity_trade_note').hidden=false
    
    var myChart = echarts.init(document.getElementById('bubble_chart'));
    myChart.showLoading({
        text: "loading"
    });

    var avg_similar = document.getElementById('avg_similar');
    avg_similar.innerHTML= data.avg_similarity;

    var avg_trade = document.getElementById('avg_trade');
    avg_trade.innerHTML= numberWithCommas(data.avg_trade);

    var correlation_value = data.correlation;
    var correlation = document.getElementById('correlation_value');
    correlation.innerHTML= correlation_value;

    correlation_statement = "";
    if (correlation_value >=0.5){
        correlation_statement="Positive Correlation between votes similarity and trade volume"
    }
    else if (correlation_value <=(-0.5)){
        correlation_statement="Negative Correlation between votes similarity and trade volume"
    }
    else {
        correlation_statement="Neutral Correlation between votes and trade volume"
    }
    
    var correlation_text = document.getElementById('correlation_statement');
    correlation_text.innerHTML= correlation_statement;

    // specify chart configuration item and data
    data_val = data.chart_data
    
    x_values = []
    y_values = []
    trade_values = []

    data.chart_data.forEach(appendElements);
    data.chart_data.forEach(appendElements2);
    data.chart_data.forEach(getTrade);

    function appendElements(item) {
        x_values.push(item[0])
    }
    function appendElements2(item) {
        y_values.push(item[1])
    }

    function getTrade(item) {
        trade_values.push(item[2])
    }

    function normalizeValues(val,max,min) {
        equ = (val - min) / (max - min);
        return sizeFunction(equ+0.1);
    }

    max_value = Math.max(...trade_values)
    min_value = Math.min(...trade_values)

    option = {
        xAxis: {
            data: x_values,
            name: 'Years',
            nameGap: 30,
            nameLocation: 'middle',
            nameTextStyle: {
                fontSize: 16
            }
        },
        yAxis: {
            min:0,
            max:100,
            name: 'Percentage of Similar Votes',
            nameGap: 30,
            nameLocation: 'middle',
            nameTextStyle: {
                fontSize: 16
            }
        },
        series: [{
            type: 'line',
            symbolSize: 15,
            data: data_val
        }, {
            type: 'scatter',
            data: data_val,
            symbolSize: function (data) {   
                return normalizeValues(data[2],max_value,min_value);
            },
            emphasis: {
                label: {
                    show: true,
                    formatter: function (param) {
                        return numberWithCommas(param.data[2])+" m";
                    },
                    position: 'top'
                }
            },
            itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(25, 100, 150, 0.5)',
                shadowOffsetY: 4,
                color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
                    offset: 0,
                    color: 'rgb(196, 203, 202)'
                }, {
                    offset: 1,
                    color: 'rgb(196, 203, 202)'
                }])
            }
        }]
    };

    // use configuration item and data specified to show chart
    myChart.setOption(option);
    myChart.hideLoading();

}

function showChartCountry(data) {
    document.getElementById('bar_chart_country').hidden = false
    document.getElementById('insigts_bar_chart').hidden = false

    var myChart = echarts.init(document.getElementById('bar_chart_country'));

    // var avg_similar = document.getElementById('avg_similar');
    // avg_similar.innerHTML = data.avg_similarity;

    var bar_chart_country = echarts.init(document.getElementById('bar_chart_country'));
    var weatherIcons = {
        'IP': 'assets/images/fight.png',
        'NW': 'assets/images/nuclear.png',
        'HR': 'assets/images/law.png',
        'AC': 'assets/images/firearm.png',
        'ED': 'assets/images/rise.png',
        'CO': 'assets/images/crime.png'
    };

    var seriesLabel = {
        normal: {
            show: true,
            textBorderColor: '#333',
            textBorderWidth: 2
        }
    }

    option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['Yes', 'No', 'Abstain']
        },
        grid: {
            left: 100
        },
        xAxis: {
            type: 'value',
            name: 'Number of Votes',
            axisLabel: {
                formatter: '{value}'
            },
            nameGap: 40,
            nameLocation: 'middle',
            nameTextStyle: {
                fontSize: 16
            }
        },
        yAxis: {
            type: 'category',
            inverse: true,
            data: ['IP', 'NW', 'HR', 'AC', 'ED', 'CO'],
            axisLabel: {
                formatter: function (value) {
                    return '{' + value + '| }\n{value|' + value + '}';
                },
                margin: 20,
                rich: {
                    value: {
                        lineHeight: 20,
                        align: 'center'
                    },
                    IP: {
                        height: 40,
                        align: 'center',
                        backgroundColor: {
                            image: weatherIcons.IP
                        }
                    },
                    NW: {
                        height: 40,
                        align: 'center',
                        backgroundColor: {
                            image: weatherIcons.NW
                        }
                    },
                    HR: {
                        height: 40,
                        align: 'center',
                        backgroundColor: {
                            image: weatherIcons.HR
                        }
                    },
                    AC: {
                        height: 40,
                        align: 'center',
                        backgroundColor: {
                            image: weatherIcons.AC
                        }
                    },
                    ED: {
                        height: 40,
                        align: 'center',
                        backgroundColor: {
                            image: weatherIcons.ED
                        }
                    },
                    CO: {
                        height: 40,
                        align: 'center',
                        backgroundColor: {
                            image: weatherIcons.CO
                        }
                    }
                }
            }
        },
        series: [
            {
                name: 'Yes',
                type: 'bar',
                data: data.yes_data,
                label: seriesLabel,
                itemStyle: {
                    color: "#6BA368"
                }
            },
            {
                name: 'No',
                type: 'bar',
                label: seriesLabel,
                data: data.no_data
            },
            {
                name: 'Abstain',
                type: 'bar',
                label: seriesLabel,
                data: data.abstain_data
            }
        ]
    };

    myChart.setOption(option);
    myChart.showLoading({
        text: "loading"
    });
    myChart.hideLoading();
}

function showError(theError) {
    var someHTML = `
      <div class="alert alert-danger" role="alert">
      Oh no! - ${theError} :(
      </div>
      `;
    console.log(someHTML);
}

///////////////////// Processing ////////////////////////////

function processVotingSimilarityData(response) {
    if (response.status === 200) {
        response.json()
            .then(function (data) {
                showChart(data);
            }).catch(function () { showError("JSON Messed Up"); });
    }
    else {
        response.json()
            .then(function (data) {
                showError("Errorrr");
            })
    }
}

function processCountryVotings(response) {
    if (response.status === 200) {
        response.text()
            .then(function (data) {
                data = data.substr(8);
                data = data.replace(/'/g, '"');
                data = JSON.parse(data);
                showChartCountry(data);
            }).catch(function () { showError("JSON Messed Up"); });
    }
    else {
        response.text()
            .then(function (data) {
                showError("Errorrr");
            })
    }
}

///////////////////// Events ////////////////////////////
function submitData(e) {
    e.preventDefault();

    ccode1 = document.getElementById("sel1");
    ccode1 = ccode1.options[ccode1.selectedIndex].value

    ccode2 = document.getElementById("sel2");
    ccode2 = ccode2.options[ccode2.selectedIndex].value

    decade = document.getElementById("sel3");
    decade = decade.options[decade.selectedIndex].value
    
    url_api = "https://datavisbackend.azurewebsites.net/api/votingSimilarity?ccode1="+ccode1+"&ccode2="+ccode2+"&decade="+decade
    fetch(url_api, {
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': 'null'
        }
    }).then((res) => processVotingSimilarityData(res))
}

function submitDataCountryChart(val) {
    url_api = "https://datavisbackend.azurewebsites.net/api/votingCountryResolution?ccode="+val
    fetch(url_api, {
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-type': 'application/json'
        }
    }).then((res) => processCountryVotings(res))
}