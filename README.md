# BitBurner Scripts

This is my personal script library for BitBurner (Steam version)

# Ports

| Port Number | Description          |
| ----------- | -----------          |
| 1           | Project Starting     |
| 2           | Task Completion      |
| 3           | Project Completion   |
| 4           | New Server Discovery |

# Conventions
- scripts prefixed with "t_" represent an independent task.  These typically require a target server, but should be capable of running independently of anything else, including utils.
- scripts prefixed with "d_" represent daemons.  These are effectively scripts that run forever, as long as their state is maintained, and they do not encounter errors.
- scripts prefixed with "r_" represent reports.  This will print directly to the terminal.
- scripts prefixed with "u_" represent utilities.  These are handy for manual tasks.

# Cluster Architecture
The cluster is designed to run as lambdas.  Actions of the cluster are designed as "Projects" where each project has a type which correlates to a specific task script, at a requested number of threads.  Projects are further subdivided into "Tasks" and "Follow-Up Projects".  Tasks are the task script executing on a given target cluster member at a specific thread count.  This is meaningless where a Project requires few threads (1 - 4), but very important where a project requires many threads (100+).  For Example, if a Project requests 50 threads, and each cluster member can only support 2 threads, the Project will run as 25 Tasks, each of 2 threads, 1 task per cluster member.  Follow-Up projects occur when the cluster is unable to meet the requested thread count of the original project, and it must therefor queue up a project requesting the remainder of the threads.  In the previous example, we requested 50 threads, where each member could handle 2 threads at a time.  If the cluster had only 10 members, the Tasker Daemon would split the original Project into 2, the first handling 20 threads, the second requesting 30.  The second project would also get split, with the new project requesting only 10 threads.

While the Tasker Daemon handles the division of Tasks and Projects, the Scanner Daemon decides which projects to start by continually scanning all known hosts to identify appropriate actions.

The Discovery Daemon finds new servers, and announces them so that the other daemons stay up to date.

The Rancher Daemon is responsible for the active purchasing and upgrading of player-owned servers.  It will always try to purchase maximum servers, and upgrade them sequentially to maximum RAM.  Once it reaches max servers at max RAM, it will exit.

# Configuration
- `daemonInterval` - the time in milliseconds between each daemon run.  This is effectively the main sleep timing.  Internal cycle intervals (checking port data for example) will be 1/10th this time.
- `targetMoneyThreshold` - the threshold for percent of maximum money available on a server (expressed in decimal) to consider that server a primed target for hacking.
- `targetMoneyTakeThreshold` - target "take" threshold when hacking, as a percent of available money (expressed in decimal).
- `targetMaxSecurity` - try to reduce servers to this value before attempting to hack.
- `targetMaxOverMinSecurity` - if the server minimum security would be higher than `target max security`, instead add this number to the min security and make that the target threshold before attempting to hack.

# Notes

- according to my research, running a solver for contracts does not increase the rewards based on the threads, the rewards are only a function of multiplier stats and difficulty.
- d_scanner and d_tasker combo currently requires 12Gb RAM together.  consider moving analysis to it's own script
