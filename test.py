import asyncio
import websockets
import json

async def send_data(websocket):

    try:
        async for message in websocket:
            received_msg = json.loads(message)
            print(f"Received from client: {received_msg}")

    
            for i in range(5):  
                response = {
                    "status": "processing",
                    "progress": f"Step {i+1}/5: Processing...",
                }
                await websocket.send(json.dumps(response))
                await asyncio.sleep(1)  

    
            final_response = {
                "status": "completed",
                "result": """📜 **Carbon Emissions Report Plan**
                
                **Objective:**  
                Plan for reducing carbon emissions in 2024.
                
                **Steps:**
                - **Step 1:** Data Collection ✅
                - **Step 2:** Identifying Key Emissions Sources ✅
                - **Step 3:** Reduction Strategies ✅
                - **Step 4:** Implementation ✅
                - **Step 5:** Monitoring Progress ✅
                
                **Next Steps:** Review the plan and Approve or continue adjusting. 🔄
                """
            }
            await websocket.send(json.dumps(final_response))

    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")

async def main():
    server = await websockets.serve(send_data, "localhost", 8765)
    print("WebSocket server started at ws://localhost:8765")
    await server.wait_closed()

asyncio.run(main())
