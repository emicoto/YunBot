import { Context,segment } from "koishi"

export function random(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function either(arr) {
    let max = arr.length
    let id = random(1,max)-1
    return arr[id]
}

export function faceicon(str){
    let path = `file:///H:/_Yunbot/data/images/Yun_${str}.png`
    return segment("image",{file:path})
}

export function images(str){
    let path = `file:///H:/_Yunbot/data/images/${str}`
    return segment("image",{file:path})
}

export function include(text,arr){
    if(Array.isArray(arr)){

        for(let i in arr){
            if(text.includes(arr[i])){
                return true
            }
        }

        return false 
    }
    else{
        return text.includes(arr)
    }
}

export function groupmatch(text,arr){
    if(Array.isArray(arr)){

        for(let i in arr){
            if(text === arr[i]){
                return true
            }
        }
        return false
    }
    else{
        return text === arr
    }
}

export function At(session){
    return segment("at", { id : session.userId })
}

export function wordlink(text, arr1, arr2){
    let a=0,i=0
    for(a=0; a<arr1.length; a++){
        if(text.includes(arr1[a])){
            for(i=0; i<arr2.length; i++){
                if(text.includes(arr2[i]) && text.indexOf(arr2[i]) - (text.indexOf(arr1[a]+arr1[a].length <= 1 && text.indexOf(arr2[i]) > text.indexOf(arr1[a])))) return 1; //直接关联
                if(text.includes(arr2[i]) && text.indexOf(arr2[i]) - (text.indexOf(arr1[a])+arr1[a].length) > 1) return text.indexOf(arr2[i]) - (text.indexOf(arr1[a])+arr1[a].length)//弱关联;
            }            
        }
    }
    return 9999
}

export var userdata
export var Yunstate
export var usertoday


export function getUser(uid){
    
}