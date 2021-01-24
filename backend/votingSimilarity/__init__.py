import logging

import azure.functions as func
import pandas as pd
import numpy as np
import scipy
from scipy.stats import pearsonr
import json

dataset = None
trade_dataset = None

def trade_volume(data,country1,country2,year):
    countries_code=[country1,country2]
    
    data = data[data["year"]== year]
    
    data = data[data.ccode1.isin(countries_code)]
    data = data[data.ccode2.isin(countries_code)]
    
    try:
        trade_volumne_usd = list(data["smoothtotrade"])[0]
        #print("Trade, in ",year,": $",trade_volumne_usd)
    except:
        return 0
    
    return trade_volumne_usd

def voting_similarity(data,country1,country2,year):
    countries = [country1,country2]
    filtered_data = data[data["year"]==year]
    filtered_data=filtered_data[filtered_data.ccode.isin(countries)]
    pivot = pd.pivot_table(filtered_data,index=["resid"],
                           values="Country",
                           aggfunc="count",
                           columns=["ccode","vote_type"])

    matching_count = 0
    
    c1_no = True
    c1_yes = True
    c1_abstain = True
    
    c2_no = True
    c2_yes = True
    c2_abstain = True
    
    for index, row in pivot.iterrows():
        try:
            row[country1,"No"]
        except:
            c1_no = False
        
        try:
            row[country2,"No"]
        except:
            c2_no = False
        
        if(c1_no and c2_no):
            if(row[country1,"No"] == row[country2,"No"]):
                matching_count = matching_count + 1
                #print(index,row[country1,"No"],row[country2,"No"])
        
        try:
            row[country1,"Yes"]
        except:
            c1_yes = False
        
        try:
            row[country2,"Yes"]
        except:
            c2_yes = False
        
        if(c1_yes and c2_yes):
            if(row[country1,"Yes"] == row[country2,"Yes"]):
                matching_count = matching_count + 1
                #print(index,row[country1,"Yes"],row[country2,"Yes"])
                
        
        try:
            row[country1,"Abstain"]
        except:
            c1_abstain = False
        
        try:
            row[country2,"Abstain"]
        except:
            c2_abstain = False
        
        if(c1_abstain and c2_abstain):
            if(row[country1,"Abstain"] == row[country2,"Abstain"]):
                matching_count = matching_count + 1
                #print(index,row[country1,"Abstain"],row[country2,"Abstain"])
    
    if(len(list(pivot.index)) == 0):
        return 0
    else:   
        voting_similarity = matching_count/ len(list(pivot.index))
        #print("Similarity, in ",year,": ",voting_similarity*100,"%")
        return voting_similarity

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    global dataset
    global trade_dataset
    if dataset is None:
        dataset = pd.read_csv("https://datavizappstore.z33.web.core.windows.net/UNGA_data_v3.zip",encoding='cp1252')

    if trade_dataset is None:
        trade_dataset = pd.read_csv("https://datavizappstore.z33.web.core.windows.net/Dyadic_COW_4.0.zip",encoding='cp1252')

    ccode1 = int(req.params.get('ccode1'))
    ccode2 = int(req.params.get('ccode2'))
    decade = req.params.get('decade')
    start_year = int(decade.split("-")[0])
    end_year = int(decade.split("-")[1])+1

    avg_sum = 0
    avg_trade = 0
    array=[]
    array_trade=[]
    chart_data=[]
    range_var = range(start_year,end_year)
    for year in range_var:
        value = voting_similarity(dataset,ccode1,ccode2,year)
        trade_value = trade_volume(trade_dataset,ccode1,ccode2,year)
        array.append(value)
        array_trade.append(trade_value)
        avg_sum = avg_sum + value
        avg_trade = avg_trade + trade_value
        chart_data.append([str(year),value*100,int(trade_value)])
        
    average = avg_sum / len(range_var)
    average_trade = avg_trade / len(range_var)
    correlation_value, p_value = pearsonr(array_trade,array)
    if correlation_value!=correlation_value:correlation_value=0
    context = {
        "avg_similarity":str(int(average*100))+"%",
        "avg_trade":"$ "+str(int(average_trade))+" m",
        "correlation":round(correlation_value, 2),
        "chart_data":chart_data
    }

    if ccode1:
        return func.HttpResponse(json.dumps(context))
        
    else:
        return func.HttpResponse(
             "Please pass a country1 and country2 and a period in the parameters",
             status_code=400
        )