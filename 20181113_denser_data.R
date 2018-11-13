library(readr)
library(raster)
library(stringr)
library(dplyr)
library(jsonlite)
# https://gis.stackexchange.com/questions/279079/extract-value-of-a-raster-with-coordinates
# since sphere, can't get close enough by interpolating of raster...
setwd('./Desktop/cv_project/')
globe_tile_data <- read_csv("./globe_tile_data.csv", n_max = 17)
arr_globe_tile_data = globe_tile_data %>% arrange(lon_min, desc(lat_min)) %>% filter(!str_detect(Tile, "10B"))
unique_lon_min = unique(globe_tile_data$lon_min)

LENGTH_CUTOFF = 0

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


# Subsample and export... BASED ON LATITUDE
# For latitude previous frequency seemed fine
# ORIG
indx_rows = seq(1, nrow(combined), 10)
# HIGH NUMBER OF LINES
# indx_rows = seq(1, nrow(combined), 5)
# LOW LEVEL OF LINES
# indx_rows = seq(1, nrow(combined), 20)

latnames_max = max(arr_globe_tile_data$lat_max)
latnames_min = min(arr_globe_tile_data$lat_min)
lat_range = latnames_max - latnames_min
sample_max = ncol(combined)
# Interpolation
lerp = function(v0, v1, t) {
  return((1 - t) * v0 + t * v1)
}
# lerp(90, -90, 0.62)
# max circumference will start with number pixel in x-dir, but may need to downsample further

calc_num_points = function(sample_max, lat_deg){
  # From that we can C= PI*2*radius => radius = C/2*PI 
  ref_radius_pixel_units = floor(sample_max / (2 * pi))
  latitude_rad = lat_deg * 2*pi/360  
  radius_spherical_cal_at_lat = abs(ref_radius_pixel_units * cos(latitude_rad))
  # Want to get back to the cirucumference at this latitude
  # C = PI * 2 * radius
  circumference_pixels_const_ratio = floor(pi * 2 * radius_spherical_cal_at_lat)
  return(circumference_pixels_const_ratio)
}

process_row = function(row, num_to_sample){
  idx_sample = seq(1,length(row), length(row)/num_to_sample) %>% round()
  down_sampled = row[idx_sample]
  ds_df = data.frame(down_sampled)
  ds_df$prev_val = c(ds_df$down_sampled[nrow(ds_df)], ds_df$down_sampled[1:(nrow(ds_df)-1)])
  ds_df$next_val = c(ds_df$down_sampled[2:nrow(ds_df)], ds_df$down_sampled[1])
  ds_df$lon = rownames(ds_df) %>% as.numeric()
  ds_df = ds_df %>% mutate(alt = ifelse(
    down_sampled == -500 &
      (prev_val != -500 |
         next_val != -500), 
    0, down_sampled
  ))
  
  
  run_length = rle(ds_df$alt != -500)
  run_length_df = data.frame(
    values = run_length$values,
    lengths = run_length$lengths
  )

  run_length_df$end_idx = cumsum(run_length$lengths)
  run_length_df$start_idx = run_length_df$end_idx - run_length_df$lengths + 1
  # The corner case of first row being true and wrapping around is negliable, northern russia part only perhaps...
  values_for_lines = run_length_df %>% filter(values == T) 
  if(nrow(values_for_lines)>0){
    lat_el_list = list()
    lat_el_list_idx = 1
    for(rowidx in 1:nrow(values_for_lines)){
      row_temp = values_for_lines[rowidx,]
      # REMOVE ROWS WITH TOO FEW SHORT DATA...
      
      if((row_temp$end_idx - row_temp$start_idx) > LENGTH_CUTOFF){
        lat_el = ds_df[row_temp$start_idx:row_temp$end_idx,]
        # lat_el = lat_el %>% select(alt, lon)
        lat_el = lat_el %>% select(a = alt, l = lon)
        lat_el_list[[lat_el_list_idx]] = lat_el
        lat_el_list_idx = lat_el_list_idx + 1
      }
    }
    return(lat_el_list)
  } else{
    return(NA)
  }

}


total = 0
subsample_factor = 1/5
list_of_points_for_export = list()
for(idx in indx_rows){
  print(idx)
  # Get the corresponding number for the latitude
  lat_processing = lerp(90, -90, idx/nrow(combined))
  # Calculate number of points to sample along latitude
  points_to_sample = calc_num_points(sample_max*subsample_factor, lat_processing)
  # at least have it be 15
  if(points_to_sample<15) {
    points_to_sample = 15
  }
  row = combined[idx,]
  result = process_row(row, num_to_sample = points_to_sample)
  if(length(result) >0){
    if(!is.na(result)){
      list_of_points_for_export[[as.character(lat_processing)]] = result
    }
  }
  # total = total + points_to_sample
  # message("lat: ", lat_processing, "points_to_sample: ", points_to_sample)
  
  
}
# message("total ", total)
toJSON(list_of_points_for_export[4:10], pretty = T)
plot(raster(combined[1:1000,])) # Rows clearly... first row = lat 90, last = -90 
write_json(list_of_points_for_export, "test_with_clean_data.json")

#########################################################
# TEST TO SUBSAMPLE ONE ROW...

# 
# 
# row = combined[120,]
# num_to_sample = 50
# idx_sample = seq(1,length(row), length(row)/num_to_sample) %>% round()
# down_sampled = row[idx_sample]
# no_name_down_sampled <- unname(down_sampled)
# ds_df = data.frame(down_sampled)
# ds_df$prev_val = c(ds_df$down_sampled[nrow(ds_df)], ds_df$down_sampled[1:(nrow(ds_df)-1)])
# ds_df$next_val = c(ds_df$down_sampled[2:nrow(ds_df)], ds_df$down_sampled[1])
# ds_df$lon = rownames(ds_df) %>% as.numeric()
# ds_df = ds_df %>% mutate(new = ifelse(
#   down_sampled == -500 &
#     (prev_val != -500 |
#      next_val != -500), 
#   0, down_sampled
#   ))
# 
# run_length = rle(ds_df$new != -500)
# run_length_df = data.frame(
#   values = run_length$values,
#   lengths = run_length$lengths
#   )
# run_length_df$end_idx = cumsum(run_length$lengths)
# run_length_df$start_idx = run_length_df$end_idx - run_length_df$lengths + 1
# # The corner case of first row being true and wrapping around is negliable, northern russia part only perhaps...
# values_for_lines = run_length_df %>% filter(values == T) 
# 
# lat_el_list = list()
# lat_el_list_idx = 1
# for(rowidx in 1:nrow(values_for_lines)){
#   row_temp = values_for_lines[rowidx,]
#   lat_el = ds_df[row_temp$start_idx:row_temp$end_idx,]
#   lat_el = lat_el %>% select(alt=new, lon)
#   lat_el_list[[lat_el_list_idx]] = lat_el
#   lat_el_list_idx = lat_el_list_idx + 1
# }
# toJSON(lat_el_list, pretty = T)




#########################################################
# # TEST
# # max circumference is number of observations in the x-direction 
# max_circum = ncol(combined)
# # From that we can C= PI*2*radius => radius = C/2*PI 
# ref_radius_pixel_units = floor(max_circum / (2 * pi))
# latitude_rad = 89 * 2*pi/360
# radius_spherical_cal_at_lat = abs(ref_radius_pixel_units * cos(latitude_rad))
# # Want to get back to the cirucumference at this latitude
# # C = PI * 2 * radius
# circumference_pixels_const_ratio = floor(pi * 2 * radius_spherical_cal_at_lat)


