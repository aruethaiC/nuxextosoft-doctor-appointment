export const truncate = (str, max) =>{
    if (str !== null){
        return str.length > max ? str.substring(0, max-1) + '...' : str;
    }
    return ""
}