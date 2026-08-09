# CMakeLists.txt for scratch/aerowlan_exercises

# Get all C++ source files directly in this directory
file(GLOB exercise_sources CONFIGURE_DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/[^.]*.cc)

foreach(source_file ${exercise_sources})
  get_filename_component(exec_name ${source_file} NAME_WLE)
  build_exec(
    EXECNAME ${exec_name}
    SOURCE_FILES ${source_file}
    LIBRARIES_TO_LINK "${ns3-libs}" "${ns3-contrib-libs}"
    EXECUTABLE_DIRECTORY_PATH ${CMAKE_OUTPUT_DIRECTORY}/scratch/aerowlan_exercises
  )
endforeach()

# Register any student submissions in the submissions subdirectory
if(EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/submissions)
  file(GLOB submission_sources CONFIGURE_DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/submissions/[^.]*.cc)
  foreach(source_file ${submission_sources})
    get_filename_component(exec_name ${source_file} NAME_WLE)
    build_exec(
      EXECNAME ${exec_name}
      EXECNAME_PREFIX "scratch_aerowlan_exercises_submissions_"
      SOURCE_FILES ${source_file}
      LIBRARIES_TO_LINK "${ns3-libs}" "${ns3-contrib-libs}"
      EXECUTABLE_DIRECTORY_PATH ${CMAKE_OUTPUT_DIRECTORY}/scratch/aerowlan_exercises/submissions
    )
  endforeach()
endif()
