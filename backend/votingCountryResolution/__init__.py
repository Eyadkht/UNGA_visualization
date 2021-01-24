import logging

import azure.functions as func
import pandas as pd
import numpy as np
import scipy
from scipy.stats import pearsonr
import json

dataset = None

def country_votes_per_resolution(dataset,ccode):
    countries = [ccode]
    filtered_data = dataset[dataset.ccode.isin(countries)]
    pivot = pd.pivot_table(filtered_data,index=["vote_type"],
                               values="Country",
                               aggfunc="count",
                               columns=["resolution_type"])
    c1_yes = True
    c1_no = True
    c1_abstain = True
    
    resolution_types = ["Israeli-Palestinian conflict","Nuclear Weapons",
                        "Human Rights","Arms Control","Economic Development",
                        "Colonialism"]
    yes_array= []
    no_array= []
    abstain_array= []
    
    try:
        pivot.loc["Yes"]
    except:
        c1_yes = False
    
    try:
        pivot.loc["No"]
    except:
        c1_no = False
            
    try:
        pivot.loc["Abstain"]
    except:
        c1_abstain = False
    
    if(c1_yes):
        for res in resolution_types:
            value = pivot.loc["Yes"][res]
            if value!=value:value=0
            yes_array.append(value)
    else:
        yes_array.append([0]*6)
        
    if(c1_no):
        for res in resolution_types:
            value = pivot.loc["No"][res]
            if value!=value:value=0
            no_array.append(value)
    else:
        no_array.append([0]*6)
        
    if(c1_abstain):
        for res in resolution_types:
            value = pivot.loc["Abstain"][res]
            if value!=value:value=0
            abstain_array.append(value)
    else:
        abstain_array.append([0]*6)
    
    return {"yes_data":yes_array,
            "no_data":no_array,
            "abstain_data":abstain_array}

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    ## Used for Cahing in Azure ££
    global dataset
    if dataset is None:
        dataset = pd.read_csv("https://datavizappstore.z33.web.core.windows.net/UNGA_data_v3.zip",encoding='cp1252')

    ccode = int(req.params.get('ccode'))
    context = country_votes_per_resolution(dataset,ccode)

    if ccode:
        return func.HttpResponse(f"objects:{context}")
    else:
        return func.HttpResponse(
             "Please pass a country",
             status_code=400
        )