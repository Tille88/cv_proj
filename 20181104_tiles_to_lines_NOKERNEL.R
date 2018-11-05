# SET UP RASTER... COMINED... SET EXTENT...



library(readr)
library(raster)
library(stringr)
library(dplyr)
# https://gis.stackexchange.com/questions/279079/extract-value-of-a-raster-with-coordinates
# since sphere, can't get close enough by interpolating of raster...
setwd('./Desktop/cv_project/')
globe_tile_data <- read_csv("./globe_tile_data.csv", n_max = 17)
arr_globe_tile_data = globe_tile_data %>% arrange(lon_min, desc(lat_min)) %>% filter(!str_detect(Tile, "10B"))
unique_lon_min = unique(globe_tile_data$lon_min)


raster_list = list()
lon_idx = 1
for(lon in unique_lon_min){
  matching_lon = arr_globe_tile_data %>% filter(lon_min == lon)
  message("matching_lon:", matching_lon)
  for(row_idx in 1:nrow(matching_lon)){
    row = matching_lon[row_idx,]
    print(row)
    # Read in data
    conn = file(paste0("../../Downloads/all10/", str_to_lower(row$Tile)), "rb")
    N_COL = row$no_col
    N_ROW = row$no_row
    data = readBin(conn, integer(), n=N_COL*N_ROW, size=2, endian = "little")
    close(conn)
    dim(data) = c(N_COL, N_ROW)
    data = t(data)
    # BUG?!?!?!
    lat_names = seq(row$lat_min, row$lat_max, 0.1)
    # lat_names = seq(row$lat_max,row$lat_min, -0.1)
    lon_names = seq(row$lon_min, row$lon_max, 0.1)
    # Sample one per lat one per lon/10
    lat_data_idx =  round(N_ROW/length(lat_names) * (lat_names-row$lat_min) * 10 + 1)
    lon_dat_idx =  floor(N_COL/(lon_names %>% length()) * (lon_names-row$lon_min) * 10 + 1)
    # Rename...
    data_subs = data[lat_data_idx, lon_dat_idx]
    dimnames(data_subs) = list(lat_names, lon_names)
    plot(raster(data_subs))
    if(is.null(raster_list[lon_idx][[1]])){
      raster_list[lon_idx][[1]] = data_subs
    } else{
      raster_list[lon_idx][[1]] = rbind(raster_list[lon_idx][[1]], data_subs)
    }
  }
  plot(raster(raster_list[lon_idx][[1]]))
  lon_idx = lon_idx + 1
  message("lon idx: ", lon_idx)
}


combined = cbind(raster_list[[1]],
                 raster_list[[2]],
                 raster_list[[3]],
                 raster_list[[4]])

# combined = combined[1:1500,]
plot(raster(combined))

# Subsample and export...
indx_rows = seq(1, nrow(combined), 10)
indx_col = seq(1, ncol(combined), 10)
dim(combined)
plot(raster(combined[1:(nrow(combined)-400),1:ncol(combined)]))
# dim(matrix(seq(1, 6), nrow=2))
down_sampled_combined = combined[indx_rows, indx_col]
rownames(down_sampled_combined)
down_sampled_combined[1:2, 1:10]

range_no = max(arr_globe_tile_data$lat_max) - min(arr_globe_tile_data$lat_min)
new_names = round(seq(max(arr_globe_tile_data$lat_max), min(arr_globe_tile_data$lat_min), -range_no/(nrow(down_sampled_combined)-1) ), 1)
rownames(down_sampled_combined) = new_names
# !RENAME HERE INSTEAD...



plot(raster(down_sampled_combined))

transposed_downsampled = down_sampled_combined %>% t()

df_for_export = as.data.frame(transposed_downsampled)
library(jsonlite)
colnames(df_for_export)
new_col_order = colnames(df_for_export) %>% as.numeric() %>% sort(decreasing = T) %>% as.character()
df_for_export = df_for_export[, new_col_order]
jsonlite::toJSON(df_for_export, pretty = T, dataframe = "columns")


jsonlite::write_json(df_for_export, "test_export_json_improved_NOKERNEL_2.json", dataframe="columns")
plot(df_for_export$`86`, type="l")


plot(raster(down_sampled_combined))

colnames(down_sampled_combined)
rownames(down_sampled_combined)
# plot(raster(down_sampled_combined["12.8":"30.8","57":"63"]))
plot(raster(down_sampled_combined[30:35, 195:200]))
plot(raster(transposed_downsampled[195:200,30:35]))
colnames(combined)[1000:2000]
rownames(combined)
plot(raster(combined[300:320,1950:2000]))
# ?!?!
# plot(combined[,"-50.3"])
# plot(df_for_export[,"-50.3"])


# plot(NA, xlim=c(0,721), ylim=c(-2000, 5500)) 
# blue = 0.7
# 
# col_names_vec = colnames(df_for_export) %>% as.numeric()
# for(i in 1:ncol(df_for_export)){
#   if(i<36){
#     
#   
#     df_for_export
#     data_row = df_for_export[,i]
#     y = col_names_vec[i]
#     
#     lines(x=seq(1, 721), y=data_row+y,
#     type="l", col=rgb(0.3,0.3,0.3))
#     # 
#     polygon(x=c(0,seq(1, 721), 722, 0),y=c(-2000, data_row+y, -2000, -2000),col=rgb(0,0.8,blue))
#     # mult_fact = mult_fact * 0.995
#     # offset = offset - 30
#     # blue = blue + 0.0005
#     # ?lines
#   }
# }

